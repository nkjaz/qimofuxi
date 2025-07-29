// 期末复习平台后端API服务
// Express应用主文件

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 导入路由
const subjectsRouter = require('./routes/subjects');
const filesRouter = require('./routes/files');

// 导入中间件
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS配置
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://qimofuxi.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求限制
const limiter = rateLimit({
    windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 1000, // 生产环境15分钟，其他环境1秒
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 生产环境100个请求，其他环境1000个请求
    message: {
        success: false,
        message: '请求过于频繁，请稍后再试',
        timestamp: new Date().toISOString()
    }
});
app.use('/api/', limiter);

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: '期末复习平台API服务运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API路由
app.use('/api/subjects', subjectsRouter);
app.use('/api', filesRouter);

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 期末复习平台API服务已启动`);
        console.log(`📍 服务地址: http://localhost:${PORT}`);
        console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
        console.log(`📚 学科API: http://localhost:${PORT}/api/subjects`);
        console.log(`📤 文件上传: http://localhost:${PORT}/api/subjects/:id/upload`);
        console.log(`📄 文件获取: http://localhost:${PORT}/api/files/:fileId`);
        console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
    });
}

module.exports = app;
