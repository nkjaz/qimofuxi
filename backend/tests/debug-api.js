// API调试脚本 - 使用Playwright测试文件上传API
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

console.log('🔍 开始API调试...');

test.describe('API调试测试', () => {
    test('调试文件上传API', async ({ request }) => {
        console.log('📡 测试服务器连接...');
        
        // 1. 测试健康检查
        try {
            const healthResponse = await request.get('http://localhost:3001/health');
            console.log(`✅ 健康检查状态: ${healthResponse.status()}`);
            
            if (healthResponse.ok()) {
                const healthData = await healthResponse.json();
                console.log('✅ 健康检查数据:', JSON.stringify(healthData, null, 2));
            }
        } catch (error) {
            console.error('❌ 健康检查失败:', error.message);
        }
        
        // 2. 测试学科API
        try {
            const subjectsResponse = await request.get('http://localhost:3001/api/subjects');
            console.log(`📚 学科API状态: ${subjectsResponse.status()}`);
            
            if (subjectsResponse.ok()) {
                const subjectsData = await subjectsResponse.json();
                console.log('📚 学科数据:', JSON.stringify(subjectsData, null, 2));
            }
        } catch (error) {
            console.error('❌ 学科API失败:', error.message);
        }
        
        // 3. 创建测试文件
        const testFileName = 'debug_test.md';
        const testFilePath = path.join(__dirname, 'temp', testFileName);
        const testContent = '# 调试测试文件\n\n这是用于调试API的测试文件。\n\n## 内容\n- 测试项目1\n- 测试项目2';
        
        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            console.log(`📁 创建临时目录: ${tempDir}`);
        }
        
        fs.writeFileSync(testFilePath, testContent, 'utf8');
        console.log(`📄 创建测试文件: ${testFilePath}`);
        
        try {
            const fileBuffer = fs.readFileSync(testFilePath);
            console.log(`📊 文件信息: 大小=${fileBuffer.length}字节, 内容长度=${testContent.length}字符`);
            
            // 4. 测试文件上传API
            console.log('📤 开始测试文件上传...');
            
            const uploadResponse = await request.post('http://localhost:3001/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });
            
            console.log(`📤 上传响应状态: ${uploadResponse.status()}`);
            console.log(`📤 上传响应头:`, uploadResponse.headers());
            
            const uploadData = await uploadResponse.text();
            console.log('📤 上传响应内容:', uploadData);
            
            // 尝试解析JSON
            try {
                const jsonData = JSON.parse(uploadData);
                console.log('📤 上传响应JSON:', JSON.stringify(jsonData, null, 2));
            } catch (parseError) {
                console.log('❌ 响应不是有效JSON');
            }
            
        } catch (error) {
            console.error('❌ 文件上传测试失败:', error.message);
            console.error('❌ 错误堆栈:', error.stack);
        } finally {
            // 清理测试文件
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
                console.log(`🗑️ 已删除测试文件: ${testFilePath}`);
            }
        }
    });
});

console.log('🎯 调试脚本准备完成');
