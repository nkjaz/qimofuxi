// 测试文件获取API
const http = require('http');

function testFileGetAPI(fileId) {
    console.log(`🔍 测试文件获取API - 文件ID: ${fileId}`);
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/files/${fileId}`,
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        console.log(`📡 文件信息响应状态: ${res.statusCode}`);
        
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            console.log('📡 文件信息响应:', responseData);
            
            try {
                const jsonData = JSON.parse(responseData);
                console.log('📡 文件信息JSON:', JSON.stringify(jsonData, null, 2));
                
                // 如果文件信息获取成功，测试文件内容获取
                if (res.statusCode === 200) {
                    testFileContentAPI(fileId);
                }
            } catch (error) {
                console.log('❌ 响应不是有效JSON');
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ 文件信息请求错误:', error.message);
    });
    
    req.end();
}

function testFileContentAPI(fileId) {
    console.log(`📄 测试文件内容获取API - 文件ID: ${fileId}`);
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/files/${fileId}/content`,
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        console.log(`📡 文件内容响应状态: ${res.statusCode}`);
        
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            console.log('📡 文件内容响应:', responseData);
            
            try {
                const jsonData = JSON.parse(responseData);
                console.log('📡 文件内容JSON:', JSON.stringify(jsonData, null, 2));
            } catch (error) {
                console.log('❌ 响应不是有效JSON');
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ 文件内容请求错误:', error.message);
    });
    
    req.end();
}

// 测试已知存在的文件ID
console.log('🚀 开始测试文件获取API...');
testFileGetAPI(5); // 使用刚才上传的文件ID
