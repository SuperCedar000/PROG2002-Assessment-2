const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// CORS 配置 - 允许客户端访问
app.use(cors());
app.use(express.json());

// 导入数据库模块
const db = require('./event_db');

// ==================== API 路由 ====================

// 调试路由 - 检查数据库状态
app.get('/debug-db', async (req, res) => {
    try {
        console.log('🔧 接收到调试请求');
        const stats = await db.getDatabaseStats();
        const allEvents = await db.getAllEvents();
        
        res.json({
            success: true,
            database_status: "connected",
            tables: {
                events: stats.events_count,
                categories: stats.categories_count,
                organisations: stats.organisations_count
            },
            events_details: stats.events_details,
            getAllEvents_result: {
                count: allEvents.length,
                sample_data: allEvents.slice(0, 3)
            },
            message: stats.events_count === 0 ? "警告: 活动表为空! 请执行 schema.sql 文件" : 
                     allEvents.length === 0 ? "警告: getAllEvents返回空数组!" : "数据正常"
        });
    } catch (error) {
        console.error('❌ 调试路由错误:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 调试端点 - 检查分类和活动匹配
app.get('/debug-categories', async (req, res) => {
    try {
        console.log('🔧 接收到分类调试请求');
        
        // 获取所有分类
        const categories = await db.getAllCategories();
        
        // 获取所有活动及其分类信息
        const events = await db.getAllEvents();
        
        res.json({
            success: true,
            categories: categories,
            events: events.map(ev => ({ 
                id: ev.id, 
                name: ev.name, 
                category_id: ev.category_id,
                category_name: ev.category_name 
            })),
            category_mapping: categories.map(cat => ({
                category_id: cat.id,
                category_name: cat.name,
                event_count: events.filter(ev => ev.category_id === cat.id).length,
                events: events.filter(ev => ev.category_id === cat.id).map(ev => ({ 
                    id: ev.id, 
                    name: ev.name 
                }))
            })),
            summary: {
                total_categories: categories.length,
                total_events: events.length,
                categories_with_events: categories.filter(cat => 
                    events.some(ev => ev.category_id === cat.id)
                ).length
            }
        });
    } catch (error) {
        console.error('❌ Debug categories error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

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

// API 路由 - 搜索活动
app.get('/api/events/search', async (req, res) => {
    try {
        const { category, location, date, keyword } = req.query;
        console.log('🔍 搜索请求参数:', { category, location, date, keyword });
        
        // 验证category参数（如果存在）
        let validatedCategory = category;
        if (category && (isNaN(category) || category <= 0)) {
            console.log(`❌ 无效的分类ID: ${category}`);
            validatedCategory = null;
        }
        
        const events = await db.searchEvents(validatedCategory, location, keyword);
        
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

// API 路由 - 根据ID获取单个活动
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        console.log(`📨 接收到获取活动详情请求 ID: ${eventId}`);
        
        // 添加验证，确保eventId是有效的数字
        if (isNaN(eventId) || eventId <= 0) {
            console.log(`❌ 无效的活动ID: ${req.params.id}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }
        
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
        console.error('❌ 获取活动详情失败:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event: ' + error.message
        });
    }
});

// 调试端点 - 测试搜索功能
app.get('/debug-search-test', async (req, res) => {
    try {
        console.log('🔍 测试搜索功能');
        
        // 测试1: 搜索所有活动
        const allEvents = await db.getAllEvents();
        
        // 测试2: 按分类搜索（测试每个分类）
        const categories = await db.getAllCategories();
        const searchTests = [];
        
        for (const category of categories) {
            const events = await db.searchEvents(category.id, null, null);
            searchTests.push({
                category_id: category.id,
                category_name: category.name,
                events_found: events.length,
                events: events.map(ev => ({ id: ev.id, name: ev.name }))
            });
        }
        
        // 测试3: 按关键词搜索
        const keywordResults = await db.searchEvents(null, null, 'Run');
        
        res.json({
            success: true,
            tests: {
                all_events_count: allEvents.length,
                category_search: searchTests,
                keyword_search: {
                    keyword: 'Run',
                    events_found: keywordResults.length,
                    events: keywordResults.map(ev => ({ id: ev.id, name: ev.name }))
                }
            },
            database_info: {
                total_categories: categories.length,
                total_events: allEvents.length
            }
        });
        
    } catch (error) {
        console.error('❌ 搜索测试错误:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
    console.error('🚨 服务器错误:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
    });
});

// 404 处理 - 对于未知API路由
app.get('*', (req, res) => {
    console.log(`❌ 未知API端点: ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// ==================== 启动服务器 ====================

// 初始化应用
async function initializeApp() {
    try {
        console.log('🔧 初始化应用...');
        
        // 测试数据库连接
        const connectionTest = await db.testConnection();
        if (!connectionTest) {
            throw new Error('数据库连接失败，请确保MySQL服务正在运行');
        }
        
        console.log('✅ 数据库连接正常');
        return true;
    } catch (error) {
        console.error('❌ 应用初始化失败:', error.message);
        console.log('\n💡 解决方案:');
        console.log('   1. 确保MySQL服务正在运行');
        console.log('   2. 检查event_db.js中的数据库配置');
        console.log('   3. 尝试重启MySQL服务');
        throw error;
    }
}

// 启动服务器
async function startServer() {
    try {
        await initializeApp();
        
        app.listen(PORT, () => {
            console.log(`\n🎉 ========== API服务器启动成功 ==========`);
            console.log(`🚀 服务器运行在: http://localhost:${PORT}`);
            console.log('\n📊 API 端点:');
            console.log(`   GET  http://localhost:${PORT}/api/events`);
            console.log(`   GET  http://localhost:${PORT}/api/categories`);
            console.log(`   GET  http://localhost:${PORT}/api/events/:id`);
            console.log(`   GET  http://localhost:${PORT}/api/events/search`);
            console.log(`   GET  http://localhost:${PORT}/debug-db`);
            console.log(`   GET  http://localhost:${PORT}/debug-categories`);
            console.log(`   GET  http://localhost:${PORT}/debug-search-test`);
            console.log('\n💡 调试步骤:');
            console.log('   1. 访问 /debug-categories 检查分类匹配');
            console.log('   2. 访问 /debug-search-test 测试搜索功能');
            console.log('=====================================\n');
        });
        
    } catch (error) {
        console.error('\n❌ 服务器启动失败:', error.message);
        process.exit(1);
    }
}

// 启动应用
startServer();