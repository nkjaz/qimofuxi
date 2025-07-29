// 检查数据库状态
const { getDatabase } = require('./config/database.js');

async function checkDatabase() {
    try {
        console.log('🔍 检查数据库状态...');
        
        const database = await getDatabase();
        
        // 检查所有表
        const tables = database.exec("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('📋 数据库表:');
        if (tables.length > 0 && tables[0].values) {
            tables[0].values.forEach(row => {
                console.log(`  - ${row[0]}`);
            });
        }
        
        // 检查subjects表数据
        try {
            const subjects = database.exec('SELECT * FROM subjects');
            console.log('\n📚 学科数据:');
            if (subjects.length > 0 && subjects[0].values) {
                console.log('列名:', subjects[0].columns);
                subjects[0].values.forEach(row => {
                    console.log('  -', row);
                });
            } else {
                console.log('  ❌ 没有学科数据');
            }
        } catch (err) {
            console.log('  ❌ subjects表不存在或查询失败:', err.message);
        }
        
        // 检查file_nodes表数据
        try {
            const files = database.exec('SELECT * FROM file_nodes LIMIT 5');
            console.log('\n📄 文件数据:');
            if (files.length > 0 && files[0].values) {
                console.log('列名:', files[0].columns);
                files[0].values.forEach(row => {
                    console.log('  -', row);
                });
            } else {
                console.log('  ✅ file_nodes表为空（正常）');
            }
        } catch (err) {
            console.log('  ❌ file_nodes表不存在或查询失败:', err.message);
        }
        
        console.log('\n✅ 数据库检查完成');
        
    } catch (error) {
        console.error('❌ 数据库检查失败:', error.message);
    }
}

checkDatabase();
