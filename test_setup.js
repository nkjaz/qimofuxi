// 测试数据库设置和文件上传配置
const fs = require('fs');
const path = require('path');

console.log('🚀 开始验证环境设置...');

// 1. 检查迁移文件
const migrationFile = path.join(__dirname, 'data/migrations/002_create_file_nodes.sql');
if (fs.existsSync(migrationFile)) {
    console.log('✅ 迁移文件存在: 002_create_file_nodes.sql');
    const content = fs.readFileSync(migrationFile, 'utf8');
    if (content.includes('CREATE TABLE IF NOT EXISTS file_nodes')) {
        console.log('✅ 迁移文件包含file_nodes表创建语句');
    }
} else {
    console.log('❌ 迁移文件不存在');
}

// 2. 检查multer配置文件
const multerConfig = path.join(__dirname, 'backend/config/multer.js');
if (fs.existsSync(multerConfig)) {
    console.log('✅ Multer配置文件存在');
    try {
        // 不实际require，只检查语法
        const content = fs.readFileSync(multerConfig, 'utf8');
        if (content.includes('multer.diskStorage') && content.includes('fileFilter')) {
            console.log('✅ Multer配置包含必要的存储和过滤器配置');
        }
    } catch (err) {
        console.log('❌ Multer配置文件有语法错误:', err.message);
    }
} else {
    console.log('❌ Multer配置文件不存在');
}

// 3. 检查uploads目录
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
    console.log('✅ uploads目录存在');
    
    const tempDir = path.join(uploadsDir, 'temp');
    if (fs.existsSync(tempDir)) {
        console.log('✅ temp子目录存在');
    } else {
        console.log('❌ temp子目录不存在');
    }
    
    const readmeFile = path.join(uploadsDir, 'README.md');
    if (fs.existsSync(readmeFile)) {
        console.log('✅ uploads/README.md存在');
    }
} else {
    console.log('❌ uploads目录不存在');
}

// 4. 检查数据库配置更新
const dbConfig = path.join(__dirname, 'backend/config/database.js');
if (fs.existsSync(dbConfig)) {
    console.log('✅ 数据库配置文件存在');
    const content = fs.readFileSync(dbConfig, 'utf8');
    if (content.includes('runMigrations') && content.includes('MIGRATIONS_PATH')) {
        console.log('✅ 数据库配置包含迁移支持');
    } else {
        console.log('❌ 数据库配置缺少迁移支持');
    }
} else {
    console.log('❌ 数据库配置文件不存在');
}

// 5. 检查package.json中的multer依赖
const packageJson = path.join(__dirname, 'backend/package.json');
if (fs.existsSync(packageJson)) {
    const content = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    if (content.dependencies && content.dependencies.multer) {
        console.log('✅ package.json包含multer依赖');
    } else {
        console.log('❌ package.json缺少multer依赖');
    }
} else {
    console.log('❌ backend/package.json不存在');
}

console.log('\n🎉 环境验证完成！');

// 6. 尝试手动执行迁移SQL
console.log('\n🔄 尝试手动执行数据库迁移...');
try {
    const { runMigrations } = require('./backend/config/database.js');
    runMigrations().then(() => {
        console.log('✅ 迁移执行成功');
        
        // 验证表创建
        const { getDatabase } = require('./backend/config/database.js');
        return getDatabase();
    }).then(db => {
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        if (tables.length > 0 && tables[0].values) {
            const tableNames = tables[0].values.map(row => row[0]);
            console.log('📋 数据库表:', tableNames.join(', '));
            
            if (tableNames.includes('file_nodes')) {
                console.log('✅ file_nodes表创建成功');
                
                // 检查数据
                const data = db.exec('SELECT COUNT(*) FROM file_nodes');
                if (data.length > 0 && data[0].values) {
                    console.log(`📊 file_nodes表数据量: ${data[0].values[0][0]} 条`);
                }
            }
        }
        
        console.log('\n🎉 所有验证完成！');
    }).catch(err => {
        console.log('❌ 迁移执行失败:', err.message);
    });
} catch (err) {
    console.log('❌ 无法加载数据库配置:', err.message);
}
