// 测试文件清理脚本
// 按照团队规范，测试通过后自动删除测试文件

const fs = require('fs');
const path = require('path');

// 需要清理的测试文件和目录
const filesToClean = [
    'tests/api/subjects.test.js',
    'tests/setup.js',
    'tests/global-setup.js',
    'tests/global-teardown.js',
    'tests/test-report.md',
    'playwright.config.js',
    'cleanup-tests.js' // 清理脚本自身
];

const dirsToClean = [
    'tests/api',
    'tests',
    'test-results',
    'playwright-report'
];

function cleanupTestFiles() {
    console.log('🧹 开始清理测试文件...');
    
    // 删除测试文件
    filesToClean.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ 已删除文件: ${file}`);
        }
    });
    
    // 删除测试目录
    dirsToClean.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`✅ 已删除目录: ${dir}`);
        }
    });
    
    console.log('✅ 测试文件清理完成');
}

// 如果直接运行此脚本，执行清理
if (require.main === module) {
    cleanupTestFiles();
}

module.exports = { cleanupTestFiles };
