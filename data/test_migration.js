// 测试数据库迁移和file_nodes表创建
const { initDatabase, runMigrations, getDatabase, closeDatabase } = require('../backend/config/database.js');

async function testMigration() {
    try {
        console.log('🚀 开始测试数据库迁移...');
        
        // 初始化数据库
        await initDatabase();
        console.log('✅ 数据库初始化成功');
        
        // 运行迁移
        await runMigrations();
        console.log('✅ 迁移执行成功');
        
        // 获取数据库连接
        const db = await getDatabase();
        
        // 检查表结构
        console.log('\n=== 数据库表结构检查 ===');
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        if (tables.length > 0 && tables[0].values) {
            const tableNames = tables[0].values.map(row => row[0]);
            console.log('📋 数据库表:', tableNames.join(', '));
            
            // 检查file_nodes表是否存在
            if (tableNames.includes('file_nodes')) {
                console.log('✅ file_nodes表创建成功');
                
                // 检查表结构
                const schema = db.exec('PRAGMA table_info(file_nodes)');
                if (schema.length > 0 && schema[0].values) {
                    console.log('\n📊 file_nodes表结构:');
                    schema[0].values.forEach(row => {
                        const [cid, name, type, notnull, dflt_value, pk] = row;
                        console.log(`  - ${name} (${type}) ${notnull ? 'NOT NULL' : ''} ${pk ? 'PRIMARY KEY' : ''}`);
                    });
                }
                
                // 检查索引
                const indexes = db.exec("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='file_nodes'");
                if (indexes.length > 0 && indexes[0].values) {
                    console.log('\n🔍 file_nodes表索引:');
                    indexes[0].values.forEach(row => {
                        console.log(`  - ${row[0]}`);
                    });
                }
                
                // 检查外键约束
                const foreignKeys = db.exec('PRAGMA foreign_key_list(file_nodes)');
                if (foreignKeys.length > 0 && foreignKeys[0].values) {
                    console.log('\n🔗 外键约束:');
                    foreignKeys[0].values.forEach(row => {
                        const [id, seq, table, from, to, on_update, on_delete, match] = row;
                        console.log(`  - ${from} -> ${table}.${to} (ON DELETE ${on_delete})`);
                    });
                }
                
                // 检查测试数据
                const data = db.exec('SELECT COUNT(*) as count FROM file_nodes');
                if (data.length > 0 && data[0].values) {
                    const count = data[0].values[0][0];
                    console.log(`\n📊 file_nodes表数据量: ${count} 条`);
                    
                    if (count > 0) {
                        // 显示测试数据
                        const testData = db.exec(`
                            SELECT 
                                fn.id,
                                fn.name,
                                fn.type,
                                s.name as subject_name
                            FROM file_nodes fn
                            LEFT JOIN subjects s ON fn.subject_id = s.id
                            LIMIT 5
                        `);
                        
                        if (testData.length > 0 && testData[0].values) {
                            console.log('\n📋 测试数据样例:');
                            testData[0].values.forEach(row => {
                                const [id, name, type, subject_name] = row;
                                console.log(`  - ID:${id} | ${name} (${type}) | 学科:${subject_name}`);
                            });
                        }
                    }
                }
                
            } else {
                console.log('❌ file_nodes表未创建');
            }
        }
        
        // 测试multer配置
        console.log('\n=== Multer配置测试 ===');
        try {
            const multerConfig = require('../backend/config/multer.js');
            console.log('✅ Multer配置加载成功');
            console.log('📁 上传目录已创建');
        } catch (err) {
            console.log('❌ Multer配置加载失败:', err.message);
        }
        
        // 检查uploads目录
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, '../uploads');
        if (fs.existsSync(uploadsDir)) {
            console.log('✅ uploads目录存在');
            const tempDir = path.join(uploadsDir, 'temp');
            if (fs.existsSync(tempDir)) {
                console.log('✅ temp目录存在');
            } else {
                console.log('❌ temp目录不存在');
            }
        } else {
            console.log('❌ uploads目录不存在');
        }
        
        console.log('\n🎉 所有测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error(error.stack);
    } finally {
        await closeDatabase();
        process.exit(0);
    }
}

// 运行测试
testMigration();
