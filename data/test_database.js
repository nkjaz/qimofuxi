// 数据库连接测试脚本
// 用于验证SQLite数据库是否正确创建和配置

const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'database.sqlite');

try {
    // 连接数据库
    const db = new Database(dbPath);
    
    console.log('✅ 数据库连接成功');
    
    // 验证表结构
    const tableInfo = db.prepare("PRAGMA table_info(subjects)").all();
    console.log('📋 subjects表结构:');
    tableInfo.forEach(column => {
        console.log(`  - ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // 验证索引
    const indexes = db.prepare("PRAGMA index_list(subjects)").all();
    console.log('🔍 subjects表索引:');
    indexes.forEach(index => {
        console.log(`  - ${index.name}: ${index.unique ? 'UNIQUE' : 'NON-UNIQUE'}`);
    });
    
    // 验证数据
    const subjects = db.prepare("SELECT id, name, created_at FROM subjects ORDER BY created_at").all();
    console.log('📊 测试数据:');
    subjects.forEach(subject => {
        console.log(`  - ID: ${subject.id}, 名称: ${subject.name}, 创建时间: ${subject.created_at}`);
    });
    
    // 测试查询性能
    const start = Date.now();
    const count = db.prepare("SELECT COUNT(*) as count FROM subjects WHERE name LIKE ?").get('%数学%');
    const end = Date.now();
    console.log(`🚀 查询性能测试: ${end - start}ms (结果: ${count.count}条记录)`);
    
    db.close();
    console.log('✅ 数据库测试完成，所有功能正常');
    
} catch (error) {
    console.error('❌ 数据库测试失败:', error.message);
    process.exit(1);
}
