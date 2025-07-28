// 错误处理中间件
// 统一的错误处理和响应格式

// 自定义错误类
class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// 404处理中间件
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`路径 ${req.originalUrl} 不存在`, 404, 'ROUTE_NOT_FOUND');
    next(error);
};

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // 记录错误日志
    console.error(`❌ 错误发生: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // SQLite错误处理
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        error = new AppError('数据已存在，请检查输入', 400, 'DUPLICATE_ENTRY');
    }
    
    if (err.code === 'SQLITE_CONSTRAINT') {
        error = new AppError('数据约束违反，请检查输入', 400, 'CONSTRAINT_VIOLATION');
    }

    // 验证错误处理
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400, 'VALIDATION_ERROR');
    }

    // JSON解析错误
    if (err.type === 'entity.parse.failed') {
        error = new AppError('请求数据格式错误', 400, 'INVALID_JSON');
    }

    // 默认错误响应
    const statusCode = error.statusCode || 500;
    const message = error.isOperational ? error.message : '服务器内部错误';
    const code = error.code || 'INTERNAL_SERVER_ERROR';

    res.status(statusCode).json({
        success: false,
        message,
        code,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            originalError: err.message 
        })
    });
};

// 异步错误捕获包装器
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
    asyncHandler
};
