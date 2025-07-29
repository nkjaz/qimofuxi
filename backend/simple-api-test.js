// 简单的API测试脚本
const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建测试文件
const testContent = '# 测试文件\n\n这是一个测试Markdown文件。\n\n## 内容\n- 项目1\n- 项目2';
const testFilePath = path.join(__dirname, 'tests', 'temp', 'simple_test.md');

// 确保目录存在
const tempDir = path.dirname(testFilePath);
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

fs.writeFileSync(testFilePath, testContent, 'utf8');
console.log('📄 创建测试文件:', testFilePath);

// 构建multipart/form-data请求
function createMultipartData(filePath, fieldName = 'file') {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    
    let data = '';
    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n`;
    data += `Content-Type: text/markdown\r\n`;
    data += `\r\n`;
    
    const header = Buffer.from(data, 'utf8');
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    
    return {
        boundary,
        data: Buffer.concat([header, fileContent, footer])
    };
}

// 发送HTTP请求
function testAPI() {
    console.log('🚀 开始测试API...');
    
    const multipart = createMultipartData(testFilePath);
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/subjects/1/upload',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${multipart.boundary}`,
            'Content-Length': multipart.data.length
        }
    };
    
    const req = http.request(options, (res) => {
        console.log(`📡 响应状态: ${res.statusCode}`);
        console.log(`📡 响应头:`, res.headers);
        
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            console.log('📡 响应内容:', responseData);
            
            try {
                const jsonData = JSON.parse(responseData);
                console.log('📡 响应JSON:', JSON.stringify(jsonData, null, 2));
            } catch (error) {
                console.log('❌ 响应不是有效JSON');
            }
            
            // 清理测试文件
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
                console.log('🗑️ 已删除测试文件');
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ 请求错误:', error.message);
    });
    
    req.write(multipart.data);
    req.end();
}

// 先测试健康检查
const healthOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET'
};

console.log('🏥 测试健康检查...');
const healthReq = http.request(healthOptions, (res) => {
    console.log(`🏥 健康检查状态: ${res.statusCode}`);
    
    let healthData = '';
    res.on('data', (chunk) => {
        healthData += chunk;
    });
    
    res.on('end', () => {
        console.log('🏥 健康检查响应:', healthData);
        
        if (res.statusCode === 200) {
            // 健康检查通过，开始测试API
            setTimeout(testAPI, 1000);
        } else {
            console.error('❌ 服务器健康检查失败');
        }
    });
});

healthReq.on('error', (error) => {
    console.error('❌ 健康检查请求错误:', error.message);
});

healthReq.end();
