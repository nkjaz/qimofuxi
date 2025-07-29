// 测试数据库连接
const { initDatabase, getDatabase } = require('./config/database');

async function testDatabase() {
    try {
        console.log('开始测试数据库连接...');
        
        const db = await initDatabase();
        console.log('数据库初始化成功');
        
        // 测试查询
        const result = db.exec('SELECT COUNT(*) as count FROM subjects');
        console.log('查询结果:', result);
        
        console.log('数据库测试完成');
    } catch (error) {
        console.error('数据库测试失败:', error);
    }
}

testDatabase();
