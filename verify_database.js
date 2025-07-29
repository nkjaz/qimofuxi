// 简单的数据库验证脚本
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function verifyDatabase() {
    try {
        console.log('开始验证数据库...');
        
        // 初始化sql.js
        const SQL = await initSqlJs();
        
        // 读取数据库文件
        const dbPath = path.join(__dirname, 'data/database.sqlite');
        let filebuffer;
        
        try {
            filebuffer = fs.readFileSync(dbPath);
            console.log('✅ 数据库文件读取成功');
        } catch (err) {
            console.log('❌ 数据库文件不存在，创建新数据库');
            filebuffer = null;
        }
        
        // 创建数据库实例
        const db = new SQL.Database(filebuffer);
        
        // 执行迁移SQL
        const migrationPath = path.join(__dirname, 'data/migrations/002_create_file_nodes.sql');
        if (fs.existsSync(migrationPath)) {
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            console.log('执行迁移SQL...');
            db.exec(migrationSQL);
            console.log('✅ 迁移执行成功');
        }
        
        // 检查表结构
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        if (tables.length > 0 && tables[0].values) {
            console.log('数据库表:', tables[0].values.map(row => row[0]).join(', '));
        }
        
        // 检查file_nodes表
        try {
            const schema = db.exec('PRAGMA table_info(file_nodes)');
            if (schema.length > 0 && schema[0].values) {
                console.log('file_nodes表字段:');
                schema[0].values.forEach(row => {
                    console.log(`  ${row[1]} (${row[2]})`);
                });
            }
        } catch (err) {
            console.log('❌ file_nodes表检查失败:', err.message);
        }
        
        // 保存数据库
        const data = db.export();
        fs.writeFileSync(dbPath, data);
        console.log('✅ 数据库已保存');
        
        db.close();
        console.log('✅ 验证完成');
        
    } catch (error) {
        console.error('❌ 验证失败:', error.message);
    }
}

verifyDatabase();
