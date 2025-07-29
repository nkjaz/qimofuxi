// 数据库连接配置
// SQLite数据库连接和配置管理

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, '../../data/database.sqlite');

// 迁移文件目录路径
const MIGRATIONS_PATH = path.join(__dirname, '../../data/migrations');

// 创建数据库连接
let db = null;
let SQL = null;

const initDatabase = async () => {
    try {
        if (!db) {
            // 初始化sql.js
            SQL = await initSqlJs();

            // 读取现有数据库文件
            let filebuffer;
            try {
                filebuffer = fs.readFileSync(DB_PATH);
                console.log('✅ 读取现有数据库文件成功');
            } catch (err) {
                console.log('⚠️ 数据库文件不存在，创建新数据库');
                filebuffer = null;
            }

            // 创建数据库实例
            db = new SQL.Database(filebuffer);

            console.log('✅ 数据库连接成功');
            console.log(`📍 数据库路径: ${DB_PATH}`);

            // 验证数据库表是否存在
            try {
                const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
                if (tables.length > 0 && tables[0].values) {
                    const tableNames = tables[0].values.map(row => row[0]);
                    console.log('📋 数据库表:', tableNames.join(', '));
                } else {
                    console.log('📋 数据库表: 无表存在');
                }
            } catch (err) {
                console.log('📋 数据库表查询失败:', err.message);
            }
        }

        return db;
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        throw error;
    }
};

// 获取数据库连接
const getDatabase = async () => {
    if (!db) {
        return await initDatabase();
    }
    return db;
};

// 保存数据库到文件
const saveDatabase = () => {
    try {
        if (db) {
            const data = db.export();
            fs.writeFileSync(DB_PATH, data);
            console.log('💾 数据库已保存到文件');
        }
    } catch (error) {
        console.error('❌ 保存数据库失败:', error.message);
    }
};

// 关闭数据库连接
const closeDatabase = async () => {
    try {
        if (db) {
            // 保存数据库到文件
            saveDatabase();

            // 关闭数据库
            db.close();
            db = null;
            console.log('🔒 数据库连接已关闭');
        }
    } catch (error) {
        console.error('❌ 关闭数据库失败:', error.message);
    }
};

// 数据库健康检查
const checkDatabaseHealth = async () => {
    try {
        const database = await getDatabase();
        const result = database.exec('SELECT 1 as health');
        return result.length > 0 && result[0].values.length > 0 && result[0].values[0][0] === 1;
    } catch (error) {
        console.error('❌ 数据库健康检查失败:', error.message);
        return false;
    }
};

// 执行数据库事务
const executeTransaction = async (operations) => {
    try {
        const database = await getDatabase();

        database.run('BEGIN TRANSACTION');

        try {
            for (const operation of operations) {
                operation();
            }
            database.run('COMMIT');

            // 保存到文件
            saveDatabase();

            return true;
        } catch (error) {
            database.run('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('❌ 事务执行失败:', error.message);
        throw error;
    }
};

// 优雅关闭处理
process.on('SIGINT', async () => {
    console.log('\n🛑 接收到关闭信号，正在关闭数据库连接...');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 接收到终止信号，正在关闭数据库连接...');
    await closeDatabase();
    process.exit(0);
});

// 运行数据库迁移
const runMigrations = async () => {
    try {
        const database = await getDatabase();

        // 创建迁移记录表
        database.run(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 获取已执行的迁移
        const executedMigrations = database.exec('SELECT filename FROM migrations');
        const executedFiles = executedMigrations.length > 0 && executedMigrations[0].values
            ? executedMigrations[0].values.map(row => row[0])
            : [];

        // 读取迁移文件
        if (!fs.existsSync(MIGRATIONS_PATH)) {
            console.log('⚠️ 迁移目录不存在，跳过迁移');
            return;
        }

        const migrationFiles = fs.readdirSync(MIGRATIONS_PATH)
            .filter(file => file.endsWith('.sql'))
            .sort(); // 按文件名排序确保执行顺序

        console.log(`📋 发现 ${migrationFiles.length} 个迁移文件`);

        // 执行未运行的迁移
        for (const filename of migrationFiles) {
            if (!executedFiles.includes(filename)) {
                console.log(`🔄 执行迁移: ${filename}`);

                const migrationPath = path.join(MIGRATIONS_PATH, filename);
                const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

                // 执行迁移SQL
                database.exec(migrationSQL);

                // 记录迁移执行
                database.run('INSERT INTO migrations (filename) VALUES (?)', [filename]);

                console.log(`✅ 迁移完成: ${filename}`);
            } else {
                console.log(`⏭️ 跳过已执行的迁移: ${filename}`);
            }
        }

        // 保存数据库
        saveDatabase();
        console.log('✅ 所有迁移执行完成');

    } catch (error) {
        console.error('❌ 迁移执行失败:', error.message);
        throw error;
    }
};

module.exports = {
    initDatabase,
    getDatabase,
    closeDatabase,
    checkDatabaseHealth,
    executeTransaction,
    saveDatabase,
    runMigrations
};
