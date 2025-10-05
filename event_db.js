// event_db.js - MySQL Database connection
const mysql = require('mysql2');

// 创建数据库连接池 - 使用密码 root123
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

// 获取所有活动
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

module.exports = {
    pool: promisePool,
    testConnection,
    getAllEvents,
    getEventById,
    searchEvents,
    getAllCategories,
    getDatabaseStats
};