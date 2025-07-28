// 全局测试设置
// 启动测试服务器和准备测试环境

const { spawn } = require('child_process');
const { setupTestEnvironment } = require('./setup');
const axios = require('axios');

let serverProcess;

async function globalSetup() {
    console.log('🚀 开始全局测试设置...');

    // 准备测试环境
    await setupTestEnvironment();

    // 启动测试服务器
    console.log('📡 启动测试服务器...');
    serverProcess = spawn('node', ['app.js'], {
        env: { ...process.env, NODE_ENV: 'test', PORT: '3001' },
        stdio: 'pipe'
    });

    // 等待服务器启动
    await waitForServer('http://localhost:3001/health', 30000);

    console.log('✅ 全局测试设置完成');

    // 将服务器进程ID保存到全局变量
    global.__SERVER_PROCESS__ = serverProcess;
}

async function waitForServer(url, timeout = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                console.log('✅ 服务器已启动并响应正常');
                return;
            }
        } catch (error) {
            // 服务器还未启动，继续等待
        }

        // 等待500ms后重试
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error(`服务器在 ${timeout}ms 内未能启动`);
}

module.exports = globalSetup;
