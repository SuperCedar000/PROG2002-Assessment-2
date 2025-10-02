// initialize-db.js - 数据库初始化脚本
const db = require('./event_db_mysql');

async function initializeAndTest() {
    console.log('🚀 开始初始化数据库...');
    
    try {
        // 1. 测试连接
        console.log('1. 测试数据库连接...');
        const connectionTest = await db.testConnection();
        if (!connectionTest) {
            console.error('❌ 数据库连接失败，请检查MySQL服务是否运行');
            return;
        }
        
        // 2. 初始化数据库结构
        console.log('2. 创建数据库和表...');
        const initResult = await db.initializeDatabase();
        if (!initResult) {
            console.error('❌ 数据库初始化失败');
            return;
        }
        
        // 3. 插入样本数据
        console.log('3. 插入样本数据...');
        const dataResult = await db.insertSampleData();
        if (!dataResult) {
            console.error('❌ 数据插入失败');
            return;
        }
        
        // 4. 测试数据查询
        console.log('4. 测试数据查询...');
        const events = await db.getAllEvents();
        const categories = await db.getAllCategories();
        
        console.log(`✅ 数据库初始化完成！`);
        console.log(`📊 活动数量: ${events.length}`);
        console.log(`🏷️ 分类数量: ${categories.length}`);
        
        console.log('\n📋 活动列表:');
        events.forEach(event => {
            console.log(`   ${event.id}. ${event.name} (${event.category_name})`);
        });
        
        console.log('\n🏷️ 分类列表:');
        categories.forEach(category => {
            console.log(`   ${category.id}. ${category.name}`);
        });
        
    } catch (error) {
        console.error('❌ 初始化过程出错:', error);
    }
}

initializeAndTest();