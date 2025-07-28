// 全局测试清理
// 关闭测试服务器和清理测试环境

const { cleanupTestEnvironment } = require('./setup');

async function globalTeardown() {
    console.log('🧹 开始全局测试清理...');
    
    // 关闭测试服务器
    if (global.__SERVER_PROCESS__) {
        console.log('🛑 关闭测试服务器...');
        global.__SERVER_PROCESS__.kill('SIGTERM');
        
        // 等待进程关闭
        await new Promise((resolve) => {
            global.__SERVER_PROCESS__.on('close', resolve);
            // 如果5秒内没有关闭，强制杀死
            setTimeout(() => {
                global.__SERVER_PROCESS__.kill('SIGKILL');
                resolve();
            }, 5000);
        });
    }
    
    // 清理测试环境
    await cleanupTestEnvironment();
    
    console.log('✅ 全局测试清理完成');
}

module.exports = globalTeardown;
