const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// CORS 配置
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// 提供静态文件（HTML、CSS、JS、图片等）
app.use(express.static(path.join(__dirname)));

// 导入数据库模块
const db = require('./event_db');

// 初始化数据库（应用启动时自动初始化）
async function initializeApp() {
    try {
        console.log('🔧 初始化应用...');
        
        // 测试数据库连接
        const connectionTest = await db.testConnection();
        if (!connectionTest) {
            console.error('❌ 数据库连接失败，请确保MySQL服务正在运行');
            process.exit(1);
        }
        
        // 初始化数据库结构
        await db.initializeDatabase();
        
        // 插入样本数据
        await db.insertSampleData();
        
        console.log('✅ 应用初始化完成');
    } catch (error) {
        console.error('❌ 应用初始化失败:', error);
    }
}

// API 路由 - 获取所有活动
app.get('/api/events', async (req, res) => {
    try {
        console.log('📨 接收到获取活动请求');
        const events = await db.getAllEvents();
        console.log(`✅ 从数据库获取到 ${events.length} 个活动`);
        
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('❌ 获取活动失败:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events: ' + error.message
        });
    }
});

// API 路由 - 获取所有分类
app.get('/api/categories', async (req, res) => {
    try {
        console.log('📨 接收到获取分类请求');
        const categories = await db.getAllCategories();
        console.log(`✅ 从数据库获取到 ${categories.length} 个分类`);
        
        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('❌ 获取分类失败:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories: ' + error.message
        });
    }
});

// API 路由 - 根据ID获取单个活动
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        console.log(`📨 接收到获取活动详情请求 ID: ${eventId}`);
        
        const event = await db.getEventById(eventId);
        
        if (event) {
            console.log(`✅ 找到活动: ${event.name}`);
            res.json({
                success: true,
                data: event
            });
        } else {
            console.log(`❌ 未找到活动 ID: ${eventId}`);
            res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event'
        });
    }
});

// API 路由 - 搜索活动
app.get('/api/events/search', async (req, res) => {
    try {
        const { q, category, location, date } = req.query;
        console.log('🔍 搜索请求参数:', { q, category, location, date });
        
        let events = [];
        
        // 如果有具体的搜索条件，使用数据库搜索功能
        if (category || location || date) {
            events = await db.searchEvents(category, location, date);
        } else {
            // 否则获取所有活动
            events = await db.getAllEvents();
        }
        
        // 如果有关键词，在前端进一步筛选
        if (q) {
            events = events.filter(event => 
                event.name.toLowerCase().includes(q.toLowerCase()) ||
                event.description.toLowerCase().includes(q.toLowerCase()) ||
                event.location.toLowerCase().includes(q.toLowerCase())
            );
        }
        
        console.log(`✅ 搜索返回 ${events.length} 个活动`);
        res.json({
            success: true,
            count: events.length,
            data: events
        });
        
    } catch (error) {
        console.error('❌ 搜索活动失败:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search events: ' + error.message
        });
    }
});

// ==================== 前端页面路由配置 ====================

// 首页路由
app.get('/home', (req, res) => {
    console.log('🏠 请求首页');
    res.sendFile(path.join(__dirname, 'home.html'));
});

// 所有活动页面路由（根路径）
app.get('/', (req, res) => {
    console.log('📋 请求所有活动页面');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 搜索页面路由
app.get('/search', (req, res) => {
    console.log('🔍 请求搜索页面');
    res.sendFile(path.join(__dirname, 'search.html'));
});
app.get('/help', (req, res) => {
    console.log('❓ 请求帮助页面');
    res.sendFile(path.join(__dirname, 'help.html'));
});

// ==================== 错误处理 ====================

// 404 处理 - 对于未知路由返回前端页面（支持前端路由）
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        // API 路由返回 404
        console.log(`❌ 未知API端点: ${req.path}`);
        res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    } else {
        // 前端路由返回首页（让前端处理路由）
        console.log(`🔄 未知前端路由 ${req.path}，重定向到首页`);
        res.sendFile(path.join(__dirname, 'home.html'));
    }
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
    console.error('🚨 服务器错误:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ==================== 启动服务器 ====================

// 启动服务器
async function startServer() {
    // 先初始化应用
    await initializeApp();
    
    // 然后启动服务器
    app.listen(PORT, () => {
        console.log(`\n🎉 ========== 服务器启动成功 ==========`);
        console.log(`🚀 服务器运行在: http://localhost:${PORT}`);
        console.log('\n📊 API 端点:');
        console.log(`   GET  http://localhost:${PORT}/api/events`);
        console.log(`   GET  http://localhost:${PORT}/api/categories`);
        console.log(`   GET  http://localhost:${PORT}/api/events/:id`);
        console.log(`   GET  http://localhost:${PORT}/api/events/search`);
        console.log('\n🌐 前端页面:');
        console.log(`   🏠 首页:     http://localhost:${PORT}/home`);
        console.log(`   📋 所有活动: http://localhost:${PORT}/`);
        console.log(`   🔍 搜索页:   http://localhost:${PORT}/search`);
        console.log(`   ❓ 帮助页:   http://localhost:${PORT}/help`);
        console.log('\n💡 提示: 请通过上面的HTTP地址访问应用');
        console.log('=====================================\n');
    });
}

// 启动应用
startServer().catch(error => {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
});