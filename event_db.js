// event_db.js - MySQL Database connection
const mysql = require('mysql2');

// 创建数据库连接池 - 使用你的密码 root123
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'charityevents_db',
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
        console.log('💡 请检查:');
        console.log('   1. MySQL服务是否启动');
        console.log('   2. 用户名: root, 密码: root123 是否正确');
        console.log('   3. MySQL端口3306是否可用');
        return false;
    }
}

// 初始化数据库（创建表和插入数据）
async function initializeDatabase() {
    try {
        console.log('🗄️  开始创建数据库...');
        
        // 创建数据库（如果不存在）
        await promisePool.query('CREATE DATABASE IF NOT EXISTS charityevents_db');
        await promisePool.query('USE charityevents_db');
        console.log('✅ 数据库创建/选择成功');
        
        // 创建categories表
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Categories表创建成功');
        
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
        console.log('✅ Organisations表创建成功');
        
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
        console.log('✅ Events表创建成功');
        
        console.log('🎉 所有数据库表创建成功');
        return true;
    } catch (error) {
        console.error('❌ 创建数据库表失败:', error);
        return false;
    }
}

// 插入样本数据 - 修复版本（包含11个活动，其中有Charity Ball分类）
async function insertSampleData() {
    try {
        // 确保使用正确的数据库
        await promisePool.query('USE charityevents_db');
        
        console.log('📝 开始插入样本数据...');
        
        // 首先检查并插入类别
        console.log('📋 插入类别数据...');
        const [categoryResult] = await promisePool.query(`
            INSERT IGNORE INTO categories (name) VALUES 
            ('Fun Run'), ('Gala Dinner'), ('Silent Auction'), 
            ('Concert'), ('Charity Ball'), ('Sports Tournament')
        `);
        console.log(`✅ 类别数据插入完成，影响行数: ${categoryResult.affectedRows}`);
        
        // 检查插入的类别ID
        const [categories] = await promisePool.query('SELECT id, name FROM categories ORDER BY id');
        console.log('📊 数据库中的类别:');
        categories.forEach(cat => {
            console.log(`   - ID: ${cat.id}, 名称: ${cat.name}`);
        });
        
        // 插入组织
        console.log('🏢 插入组织数据...');
        const [orgResult] = await promisePool.query(`
            INSERT IGNORE INTO organisations (name, description, contact_email, phone, website) VALUES 
            ('Red Cross Australia', 'Helping people in crisis', 'contact@redcross.org.au', '1800 733 276', 'https://www.redcross.org.au'),
            ('Cancer Council', 'Leading cancer charity', 'info@cancer.org.au', '13 11 20', 'https://www.cancer.org.au'),
            ('World Wildlife Fund', 'Conserving nature and wildlife', 'enquiries@wwf.org.au', '1800 032 551', 'https://www.wwf.org.au')
        `);
        console.log(`✅ 组织数据插入完成，影响行数: ${orgResult.affectedRows}`);
        
        // 检查插入的组织ID
        const [organisations] = await promisePool.query('SELECT id, name FROM organisations ORDER BY id');
        console.log('📊 数据库中的组织:');
        organisations.forEach(org => {
            console.log(`   - ID: ${org.id}, 名称: ${org.name}`);
        });
        
        // 先清空events表避免重复
        console.log('🧹 清空events表...');
        await promisePool.query('DELETE FROM events');
        await promisePool.query('ALTER TABLE events AUTO_INCREMENT = 1');
        
        // 插入活动 - 包含11个活动，其中有Charity Ball分类
        console.log('🎪 插入活动数据...');
        const [eventResult] = await promisePool.query(`
            INSERT INTO events (name, description, event_date, event_time, location, category_id, organisation_id, goal_amount, current_amount, ticket_price, is_active) VALUES 
            ('Summer Fun Run', '10km coastal run for ocean conservation', '2025-01-20', '07:00:00', 'Bondi Beach, Sydney', 1, 2, 40000.00, 25000.00, 30.00, 1),
            ('Winter Charity Gala 2025', 'Elegant formal ball for medical research', '2025-08-25', '19:30:00', 'Four Seasons Hotel', 2, 2, 60000.00, 35000.00, 120.00, 1),
            ('Art & Culture Silent Auction', 'Auction featuring local artist masterpieces', '2025-09-30', '18:30:00', 'Art Gallery of NSW', 3, 1, 20000.00, 12000.00, 0.00, 1),
            ('Hope Concert 2025', 'Live music festival for disaster relief', '2025-12-05', '20:00:00', 'Opera House, Sydney', 4, 1, 30000.00, 18000.00, 50.00, 1),
            ('Sydney Marathon 2025', 'Annual city marathon for cancer research', '2025-10-15', '08:00:00', 'Sydney Park, NSW', 1, 2, 50000.00, 32500.00, 25.00, 1),
            ('Community Basketball Tournament', 'Youth sports event for education programs', '2025-10-10', '09:00:00', 'Sydney Sports Centre', 6, 1, 15000.00, 8000.00, 15.00, 1),
            ('Wildlife Conservation Gala', 'Exclusive dinner for wildlife protection', '2025-11-20', '19:00:00', 'Hilton Hotel, Sydney', 2, 3, 75000.00, 45000.00, 150.00, 1),
            ('Classical Music Festival', 'Symphony orchestra for education funds', '2025-11-15', '19:00:00', 'City Recital Hall', 4, 3, 25000.00, 15000.00, 45.00, 1),
            ('Spring Charity Ball', 'Elegant spring ball supporting arts education programs', '2025-05-20', '19:00:00', 'Sydney Opera House', 5, 1, 55000.00, 28000.00, 125.00, 1),
            ('Annual Charity Auction', 'Live auction with celebrity hosts for children education', '2025-06-20', '18:00:00', 'Sydney Convention Centre', 3, 1, 45000.00, 22000.00, 0.00, 1),
            ('Jazz Night for Hope', 'An evening of jazz music supporting mental health awareness', '2025-07-12', '19:30:00', 'The Basement, Sydney', 4, 2, 18000.00, 9500.00, 35.00, 1)
        `);
        
        console.log(`✅ 活动数据插入完成，影响行数: ${eventResult.affectedRows}`);
        
        // 验证插入的数据
        const [verifyEvents] = await promisePool.query('SELECT COUNT(*) as count FROM events');
        console.log(`🔍 验证: 数据库中共有 ${verifyEvents[0].count} 个活动`);
        
        // 显示插入的活动详情
        const [eventDetails] = await promisePool.query(`
            SELECT e.id, e.name, c.name as category, o.name as organisation 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id
        `);
        
        console.log('📋 插入的活动列表:');
        eventDetails.forEach(event => {
            console.log(`   - ID: ${event.id}, 名称: ${event.name}, 分类: ${event.category}, 组织: ${event.organisation}`);
        });
        
        console.log('🎉 样本数据插入成功！');
        return true;
    } catch (error) {
        console.error('❌ 插入样本数据失败:', error);
        if (error.sqlMessage) {
            console.error('SQL错误信息:', error.sqlMessage);
        }
        return false;
    }
}

// 获取所有活动（用于首页）- 修复版本：移除 is_active 条件
async function getAllEvents() {
    try {
        const [rows] = await promisePool.query(`
            SELECT e.*, c.name as category_name, o.name as organisation_name 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            ORDER BY e.event_date ASC
        `);
        console.log(`🔍 getAllEvents查询返回 ${rows.length} 条记录`);
        return rows;
    } catch (error) {
        console.error('❌ 获取活动失败:', error);
        throw error;
    }
}

// 根据ID获取单个活动详情
async function getEventById(id) {
    try {
        const [rows] = await promisePool.query(`
            SELECT e.*, c.name as category_name, o.name as organisation_name,
                   o.description as organisation_description,
                   o.contact_email, o.phone, o.website
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            WHERE e.id = ?
        `, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error('❌ 获取活动详情失败:', error);
        throw error;
    }
}

// 搜索活动
async function searchEvents(category = null, location = null, date = null) {
    try {
        let query = `
            SELECT e.*, c.name as category_name, o.name as organisation_name 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            WHERE 1=1
        `;
        const params = [];

        if (category && category !== '') {
            query += ' AND c.name = ?';
            params.push(category);
        }
        if (location && location !== '') {
            query += ' AND e.location LIKE ?';
            params.push(`%${location}%`);
        }
        if (date && date !== '') {
            query += ' AND e.event_date = ?';
            params.push(date);
        }

        query += ' ORDER BY e.event_date ASC';

        const [rows] = await promisePool.query(query, params);
        return rows;
    } catch (error) {
        console.error('❌ 搜索活动失败:', error);
        throw error;
    }
}

// 获取所有类别
async function getAllCategories() {
    try {
        const [rows] = await promisePool.query('SELECT * FROM categories ORDER BY name');
        return rows;
    } catch (error) {
        console.error('❌ 获取类别失败:', error);
        throw error;
    }
}

// 强制重新初始化数据（用于修复问题）
async function forceReinitializeData() {
    try {
        console.log('🔄 强制重新初始化数据...');
        
        // 清空所有表
        await promisePool.query('DELETE FROM events');
        await promisePool.query('DELETE FROM organisations');
        await promisePool.query('DELETE FROM categories');
        
        // 重置自增ID
        await promisePool.query('ALTER TABLE events AUTO_INCREMENT = 1');
        await promisePool.query('ALTER TABLE organisations AUTO_INCREMENT = 1');
        await promisePool.query('ALTER TABLE categories AUTO_INCREMENT = 1');
        
        console.log('✅ 数据清空完成');
        
        // 重新插入数据
        return await insertSampleData();
    } catch (error) {
        console.error('❌ 强制重新初始化失败:', error);
        return false;
    }
}

// 调试函数 - 检查数据库状态
async function getDatabaseStats() {
    try {
        const [eventsCount] = await promisePool.query('SELECT COUNT(*) as count FROM events');
        const [categoriesCount] = await promisePool.query('SELECT COUNT(*) as count FROM categories');
        const [orgsCount] = await promisePool.query('SELECT COUNT(*) as count FROM organisations');
        
        const [events] = await promisePool.query(`
            SELECT e.id, e.name, e.is_active, c.name as category, o.name as organisation 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id
        `);
        
        return {
            events_count: eventsCount[0].count,
            categories_count: categoriesCount[0].count,
            organisations_count: orgsCount[0].count,
            events_details: events
        };
    } catch (error) {
        throw error;
    }
}

// 初始化应用函数
async function initializeApp() {
    console.log('\n🔧 开始初始化应用...');
    
    // 测试连接
    console.log('🔌 测试数据库连接...');
    const connectionSuccess = await testConnection();
    if (!connectionSuccess) {
        throw new Error('数据库连接失败，请检查MySQL服务是否启动');
    }
    
    // 初始化数据库结构
    console.log('🗄️  初始化数据库结构...');
    const dbInitSuccess = await initializeDatabase();
    if (!dbInitSuccess) {
        throw new Error('数据库初始化失败');
    }
    
    // 插入样本数据
    console.log('📝 插入样本数据...');
    const dataInsertSuccess = await insertSampleData();
    if (!dataInsertSuccess) {
        console.log('⚠️  样本数据插入有问题，尝试强制重新初始化...');
        const forceSuccess = await forceReinitializeData();
        if (!forceSuccess) {
            throw new Error('样本数据插入失败');
        }
    }
    
    console.log('🎉 应用初始化完成！');
    return true;
}

module.exports = {
    pool: promisePool,
    testConnection,
    initializeDatabase,
    insertSampleData,
    getAllEvents,
    getEventById,
    searchEvents,
    getAllCategories,
    initializeApp,
    forceReinitializeData,
    getDatabaseStats
};