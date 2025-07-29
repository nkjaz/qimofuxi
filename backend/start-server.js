// 简单的服务器启动脚本
console.log('🚀 正在启动服务器...');

try {
    const app = require('./app.js');
    const PORT = process.env.PORT || 3001;
    
    const server = app.listen(PORT, () => {
        console.log(`✅ 服务器已启动在端口 ${PORT}`);
        console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
    });
    
    server.on('error', (error) => {
        console.error('❌ 服务器启动错误:', error);
        process.exit(1);
    });
    
} catch (error) {
    console.error('❌ 应用启动错误:', error);
    console.error('❌ 错误堆栈:', error.stack);
    process.exit(1);
}
