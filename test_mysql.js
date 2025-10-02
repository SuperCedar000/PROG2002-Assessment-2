// test_mysql.js - MySQL Database test
const { testConnection, initializeDatabase, insertSampleData } = require('./event_db_mysql');

async function runTests() {
    console.log('🧪 Starting MySQL database tests...\n');

    // 测试连接
    console.log('1. Testing MySQL connection...');
    const connectionSuccess = await testConnection();
    
    if (!connectionSuccess) {
        console.log('💥 Connection failed. Please check your password in event_db_mysql.js');
        return;
    }

    // 初始化数据库
    console.log('\n2. Initializing database and tables...');
    const initSuccess = await initializeDatabase();
    if (!initSuccess) return;

    // 插入样本数据
    console.log('\n3. Inserting sample data...');
    const dataSuccess = await insertSampleData();
    if (!dataSuccess) return;

    console.log('\n🎉 All MySQL tests completed successfully!');
    console.log('📊 Database is ready for API development');
}

// 运行测试
runTests();