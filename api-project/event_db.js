const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'charityevents_db'
};

// 创建数据库连接池
const connection = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
    try {
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('✅ 数据库连接测试成功');
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        return false;
    }
}

// 获取数据库统计信息
async function getDatabaseStats() {
    try {
        // 获取各表数量
        const [eventsCount] = await connection.execute('SELECT COUNT(*) as count FROM events');
        const [categoriesCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        const [organisationsCount] = await connection.execute('SELECT COUNT(*) as count FROM organisations');
        
        // 获取活动详情样本
        const [eventsDetails] = await connection.execute(`
            SELECT e.id, e.name, e.is_active, c.name as category, o.name as organisation 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            ORDER BY e.id LIMIT 5
        `);
        
        return {
            events_count: eventsCount[0].count,
            categories_count: categoriesCount[0].count,
            organisations_count: organisationsCount[0].count,
            events_details: eventsDetails
        };
    } catch (error) {
        console.error('❌ 获取数据库统计失败:', error);
        throw error;
    }
}

// 获取所有活动
async function getAllEvents() {
    try {
        const query = `
            SELECT e.*, c.name as category_name, o.name as organisation_name 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            WHERE e.is_active = TRUE 
            ORDER BY e.event_date ASC
        `;
        
        const [rows] = await connection.execute(query);
        console.log(`🔍 getAllEvents查询返回 ${rows.length} 条记录`);
        return rows;
    } catch (error) {
        console.error('❌ 获取所有活动失败:', error);
        throw error;
    }
}

// 获取所有分类
async function getAllCategories() {
    try {
        const query = 'SELECT * FROM categories ORDER BY name';
        const [rows] = await connection.execute(query);
        return rows;
    } catch (error) {
        console.error('❌ 获取分类失败:', error);
        throw error;
    }
}

// 根据ID获取单个活动
async function getEventById(eventId) {
    try {
        // 再次验证eventId
        if (isNaN(eventId) || eventId <= 0) {
            throw new Error('Invalid event ID');
        }
        
        const query = `
            SELECT e.*, c.name as category_name, o.name as organisation_name 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            WHERE e.id = ?
        `;
        
        const [rows] = await connection.execute(query, [eventId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('❌ 获取活动详情失败:', error);
        throw error;
    }
}

// 搜索活动 - 简化修复版本
async function searchEvents(category = null, location = null, keyword = null) {
    try {
        console.log('🔍 开始搜索，参数:', { category, location, keyword });
        
        let query = `
            SELECT e.*, c.name as category_name, o.name as organisation_name 
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            WHERE e.is_active = TRUE
        `;
        
        const params = [];
        
        // 分类筛选
        if (category && category !== '' && !isNaN(category)) {
            const categoryId = parseInt(category);
            query += ' AND e.category_id = ?';
            params.push(categoryId);
            console.log(`🔍 按分类ID筛选: ${categoryId}`);
        }
        
        // 关键词搜索
        if (keyword && keyword !== '') {
            query += ' AND (e.name LIKE ? OR e.description LIKE ? OR e.location LIKE ?)';
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
            console.log(`🔍 按关键词筛选: ${keyword}`);
        }
        
        // 地点筛选
        if (location && location !== '') {
            query += ' AND e.location LIKE ?';
            params.push(`%${location}%`);
            console.log(`🔍 按地点筛选: ${location}`);
        }
        
        query += ' ORDER BY e.event_date ASC';
        
        console.log('🔍 最终查询:', query);
        console.log('🔍 查询参数:', params);
        
        const [rows] = await connection.execute(query, params);
        console.log(`🔍 搜索返回 ${rows.length} 个活动`);
        
        return rows;
        
    } catch (error) {
        console.error('❌ 搜索活动错误:', error);
        throw error;
    }
}

// 创建新活动
async function createEvent(eventData) {
    try {
        const query = `
            INSERT INTO events (name, description, event_date, event_time, location, category_id, organisation_id, goal_amount, current_amount, ticket_price, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            eventData.name,
            eventData.description,
            eventData.event_date,
            eventData.event_time,
            eventData.location,
            eventData.category_id,
            eventData.organisation_id,
            eventData.goal_amount || 0,
            eventData.current_amount || 0,
            eventData.ticket_price || 0,
            eventData.image_url || null
        ];
        
        const [result] = await connection.execute(query, params);
        return result.insertId;
    } catch (error) {
        console.error('❌ 创建活动失败:', error);
        throw error;
    }
}

// 更新活动
async function updateEvent(eventId, eventData) {
    try {
        const query = `
            UPDATE events 
            SET name = ?, description = ?, event_date = ?, event_time = ?, location = ?, category_id = ?, organisation_id = ?, goal_amount = ?, current_amount = ?, ticket_price = ?, image_url = ?, is_active = ?
            WHERE id = ?
        `;
        
        const params = [
            eventData.name,
            eventData.description,
            eventData.event_date,
            eventData.event_time,
            eventData.location,
            eventData.category_id,
            eventData.organisation_id,
            eventData.goal_amount,
            eventData.current_amount,
            eventData.ticket_price,
            eventData.image_url,
            eventData.is_active,
            eventId
        ];
        
        const [result] = await connection.execute(query, params);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('❌ 更新活动失败:', error);
        throw error;
    }
}

// 删除活动
async function deleteEvent(eventId) {
    try {
        const query = 'DELETE FROM events WHERE id = ?';
        const [result] = await connection.execute(query, [eventId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('❌ 删除活动失败:', error);
        throw error;
    }
}

// 获取组织列表
async function getOrganisations() {
    try {
        const query = 'SELECT * FROM organisations ORDER BY name';
        const [rows] = await connection.execute(query);
        return rows;
    } catch (error) {
        console.error('❌ 获取组织列表失败:', error);
        throw error;
    }
}

// 关闭数据库连接
async function closeConnection() {
    try {
        await connection.end();
        console.log('✅ 数据库连接已关闭');
    } catch (error) {
        console.error('❌ 关闭数据库连接失败:', error);
    }
}

// 导出所有函数和连接
module.exports = {
    connection, // 导出连接供server.js使用
    testConnection,
    getDatabaseStats,
    getAllEvents,
    getAllCategories,
    getEventById,
    searchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getOrganisations,
    closeConnection
};