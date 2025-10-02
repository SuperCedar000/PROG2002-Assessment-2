// event_db_mysql.js - MySQL Database connection
const mysql = require('mysql2');

// 创建数据库连接 - 先不指定数据库
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    // 移除 database 这一行，让代码自动创建数据库
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// 测试连接
async function testConnection() {
    try {
        const [rows] = await promisePool.query('SELECT 1 + 1 AS solution');
        console.log('✅ MySQL connection successful! Solution:', rows[0].solution);
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        return false;
    }
}

// 初始化数据库（创建表和插入数据）
async function initializeDatabase() {
    try {
        // 创建数据库
        await promisePool.query('CREATE DATABASE IF NOT EXISTS charityevents_db');
        await promisePool.query('USE charityevents_db');
        
        // 创建categories表
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 创建organisations表
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS organisations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                contact_email VARCHAR(255),
                phone VARCHAR(50),
                website VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 创建events表
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                event_date DATE NOT NULL,
                event_time TIME,
                location VARCHAR(500) NOT NULL,
                category_id INT,
                organisation_id INT,
                goal_amount DECIMAL(10,2) DEFAULT 0.00,
                current_amount DECIMAL(10,2) DEFAULT 0.00,
                ticket_price DECIMAL(8,2) DEFAULT 0.00,
                is_active BOOLEAN DEFAULT TRUE,
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (organisation_id) REFERENCES organisations(id)
            )
        `);
        
        console.log('✅ Database tables created successfully');
        return true;
    } catch (error) {
        console.error('❌ Error creating database tables:', error);
        return false;
    }
}

// 插入样本数据
async function insertSampleData() {
    try {
        // 确保使用正确的数据库
        await promisePool.query('USE charityevents_db');
        
        // 插入类别
        await promisePool.query(`
            INSERT IGNORE INTO categories (name) VALUES 
            ('Fun Run'), ('Gala Dinner'), ('Silent Auction'), 
            ('Concert'), ('Charity Ball'), ('Sports Tournament')
        `);
        
        // 插入组织
        await promisePool.query(`
            INSERT IGNORE INTO organisations (name, description, contact_email, phone, website) VALUES 
            ('Red Cross Australia', 'Helping people in crisis', 'contact@redcross.org.au', '1800 733 276', 'https://www.redcross.org.au'),
            ('Cancer Council', 'Leading cancer charity', 'info@cancer.org.au', '13 11 20', 'https://www.cancer.org.au'),
            ('World Wildlife Fund', 'Conserving nature and wildlife', 'enquiries@wwf.org.au', '1800 032 551', 'https://www.wwf.org.au')
        `);
        
        // 插入活动
        await promisePool.query(`
            INSERT IGNORE INTO events (name, description, event_date, event_time, location, category_id, organisation_id, goal_amount, current_amount, ticket_price, is_active) VALUES 
            ('nNnc Fun Run 2025', 'Annual 5km fun run for cancer research', '2025-10-15', '08:00:00', 'Sydney Park, NSW', 1, 2, 50000.00, 32500.00, 25.00, TRUE),
            ('Charity Gala Dinner', 'Elegant dinner to support wildlife conservation', '2025-11-20', '19:00:00', 'Hilton Hotel, Sydney', 2, 3, 75000.00, 45000.00, 150.00, TRUE),
            ('Art Silent Auction', 'Auction of local artist works', '2025-09-30', '18:30:00', 'Art Gallery of NSW', 3, 1, 20000.00, 12000.00, 0.00, TRUE),
            ('Hope Concert', 'Live music event for disaster relief', '2025-12-05', '20:00:00', 'Opera House, Sydney', 4, 1, 30000.00, 18000.00, 50.00, TRUE),
            ('Winter Charity Ball', 'Formal ball supporting medical research', '2025-08-25', '19:30:00', 'Four Seasons Hotel', 5, 2, 60000.00, 35000.00, 120.00, TRUE),
            ('Basketball Tournament', 'Community sports event for youth programs', '2025-10-10', '09:00:00', 'Sydney Sports Centre', 6, 1, 15000.00, 8000.00, 15.00, TRUE),
            ('Summer Fun Run', '10km run along the coastline', '2025-01-20', '07:00:00', 'Bondi Beach, Sydney', 1, 2, 40000.00, 25000.00, 30.00, TRUE),
            ('Classical Music Night', 'Orchestra performance for education funds', '2025-11-15', '19:00:00', 'City Recital Hall', 4, 3, 25000.00, 15000.00, 45.00, TRUE)
        `);
        
        console.log('✅ Sample data inserted successfully');
        return true;
    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
        return false;
    }
}

// 获取所有活动（用于首页）
async function getAllEvents() {
    try {
        await promisePool.query('USE charityevents_db');
        const [rows] = await promisePool.query(`
            SELECT e.*, c.name as category_name, o.name as organisation_name 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            WHERE e.is_active = TRUE 
            ORDER BY e.event_date ASC
        `);
        return rows;
    } catch (error) {
        console.error('Error getting events:', error);
        return [];
    }
}

// 根据ID获取单个活动详情
async function getEventById(id) {
    try {
        await promisePool.query('USE charityevents_db');
        const [rows] = await promisePool.query(`
            SELECT e.*, c.name as category_name, o.name as organisation_name,
                   o.description as organisation_description,
                   o.contact_email, o.phone, o.website
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            WHERE e.id = ? AND e.is_active = TRUE
        `, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error getting event by id:', error);
        return null;
    }
}

// 搜索活动
async function searchEvents(category = null, location = null, date = null) {
    try {
        await promisePool.query('USE charityevents_db');
        let query = `
            SELECT e.*, c.name as category_name, o.name as organisation_name 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            WHERE e.is_active = TRUE
        `;
        const params = [];

        if (category) {
            query += ' AND c.name LIKE ?';
            params.push(`%${category}%`);
        }
        if (location) {
            query += ' AND e.location LIKE ?';
            params.push(`%${location}%`);
        }
        if (date) {
            query += ' AND e.event_date = ?';
            params.push(date);
        }

        query += ' ORDER BY e.event_date ASC';

        const [rows] = await promisePool.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error searching events:', error);
        return [];
    }
}

// 获取所有类别
async function getAllCategories() {
    try {
        await promisePool.query('USE charityevents_db');
        const [rows] = await promisePool.query('SELECT * FROM categories ORDER BY name');
        return rows;
    } catch (error) {
        console.error('Error getting categories:', error);
        return [];
    }
}

module.exports = {
    pool: promisePool,
    testConnection,
    initializeDatabase,
    insertSampleData,
    getAllEvents,
    getEventById,
    searchEvents,
    getAllCategories
};