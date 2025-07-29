// 服务器测试脚本
// 用于验证API服务是否正常工作

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/subjects`;

// 测试用例
const testCases = [
    {
        name: '健康检查',
        method: 'GET',
        url: `${BASE_URL}/health`,
        expectedStatus: 200
    },
    {
        name: '获取学科列表',
        method: 'GET',
        url: API_URL,
        expectedStatus: 200
    },
    {
        name: '创建新学科',
        method: 'POST',
        url: API_URL,
        data: {
            name: '测试学科',
            description: '这是一个测试学科'
        },
        expectedStatus: 201
    },
    {
        name: '获取学科详情',
        method: 'GET',
        url: `${API_URL}/1`,
        expectedStatus: 200
    },
    {
        name: '创建重复学科（应该失败）',
        method: 'POST',
        url: API_URL,
        data: {
            name: '数学',
            description: '重复的学科名称'
        },
        expectedStatus: 400
    }
];

// 执行测试
async function runTests() {
    console.log('🧪 开始API测试...\n');
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
        try {
            console.log(`📋 测试: ${testCase.name}`);
            
            const config = {
                method: testCase.method,
                url: testCase.url,
                timeout: 5000
            };
            
            if (testCase.data) {
                config.data = testCase.data;
            }
            
            const response = await axios(config);
            
            if (response.status === testCase.expectedStatus) {
                console.log(`✅ 通过 - 状态码: ${response.status}`);
                if (response.data) {
                    console.log(`📊 响应: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
                }
                passedTests++;
            } else {
                console.log(`❌ 失败 - 期望状态码: ${testCase.expectedStatus}, 实际: ${response.status}`);
            }
            
        } catch (error) {
            if (error.response && error.response.status === testCase.expectedStatus) {
                console.log(`✅ 通过 - 预期错误状态码: ${error.response.status}`);
                console.log(`📊 错误响应: ${JSON.stringify(error.response.data, null, 2)}`);
                passedTests++;
            } else {
                console.log(`❌ 失败 - 错误: ${error.message}`);
                if (error.response) {
                    console.log(`📊 错误响应: ${JSON.stringify(error.response.data, null, 2)}`);
                }
            }
        }
        
        console.log(''); // 空行分隔
    }
    
    console.log(`🎯 测试结果: ${passedTests}/${totalTests} 通过`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！API服务运行正常。');
        process.exit(0);
    } else {
        console.log('⚠️ 部分测试失败，请检查API服务。');
        process.exit(1);
    }
}

// 等待服务器启动
async function waitForServer() {
    console.log('⏳ 等待服务器启动...');
    
    for (let i = 0; i < 10; i++) {
        try {
            await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
            console.log('✅ 服务器已启动');
            return true;
        } catch (error) {
            console.log(`⏳ 等待中... (${i + 1}/10)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('❌ 服务器启动超时');
    return false;
}

// 主函数
async function main() {
    const serverReady = await waitForServer();
    
    if (serverReady) {
        await runTests();
    } else {
        console.log('❌ 无法连接到服务器，请确保服务器正在运行');
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 测试执行失败:', error.message);
        process.exit(1);
    });
}

module.exports = { runTests, waitForServer };
