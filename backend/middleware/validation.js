// 输入验证中间件
// 学科管理相关的数据验证规则

const { body, param, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
    // 首先进行手动验证
    if (req.body && req.body.name !== undefined) {
        const name = req.body.name;

        // 检查空值
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '学科名称不能为空',
                code: 'VALIDATION_ERROR',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown'
            });
        }

        // 检查长度
        if (name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: '学科名称长度不能超过50个字符',
                code: 'VALIDATION_ERROR',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown'
            });
        }
    }

    // 然后检查express-validator的结果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        const message = errorMessages.map(err => `${err.field}: ${err.message}`).join('; ');

        // 直接返回错误响应，不抛出异常
        return res.status(400).json({
            success: false,
            message: message,
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }
    next();
};

// 危险字符过滤函数
const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;

    // 移除潜在的危险字符
    return value
        .replace(/[<>]/g, '') // 移除HTML标签字符
        .replace(/['"]/g, '') // 移除引号
        .replace(/[;]/g, '') // 移除分号
        .replace(/--/g, '') // 移除SQL注释
        .replace(/\/\*/g, '') // 移除多行注释开始
        .replace(/\*\//g, '') // 移除多行注释结束
        .trim();
};

// 学科名称验证规则
const validateSubjectName = [
    body('name')
        .exists()
        .withMessage('学科名称字段是必需的')
        .customSanitizer(sanitizeInput) // 先清理输入
        .notEmpty()
        .withMessage('学科名称不能为空')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('学科名称长度必须在1-50个字符之间')
        .custom((value) => {
            // 检查空值（防止只有空格的情况）
            if (!value || value.trim().length === 0) {
                throw new Error('学科名称不能为空或只包含空格');
            }

            // 检查字符规则
            if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/.test(value)) {
                throw new Error('学科名称只能包含中文、英文、数字、空格、连字符和下划线');
            }

            // 检查是否包含敏感词
            const sensitiveWords = ['admin', 'root', 'system', 'null', 'undefined'];
            const lowerValue = value.toLowerCase();
            for (const word of sensitiveWords) {
                if (lowerValue.includes(word)) {
                    throw new Error('学科名称包含不允许的词汇');
                }
            }
            return true;
        })
];

// 学科描述验证规则
const validateSubjectDescription = [
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('学科描述不能超过500个字符')
        .customSanitizer(sanitizeInput)
];

// 学科ID验证规则
const validateSubjectId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('学科ID必须是大于0的整数')
        .toInt()
];

// 创建学科验证中间件（简化版）
const validateCreateSubject = (req, res, next) => {
    const { name, description } = req.body;

    // 验证名称
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: '学科名称不能为空',
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    if (name.trim().length > 50) {
        return res.status(400).json({
            success: false,
            message: '学科名称长度不能超过50个字符',
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    // 验证字符规则
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
        return res.status(400).json({
            success: false,
            message: '学科名称只能包含中文、英文、数字、空格、连字符和下划线',
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    // 验证描述（可选）
    if (description && typeof description === 'string' && description.length > 500) {
        return res.status(400).json({
            success: false,
            message: '学科描述不能超过500个字符',
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    // 清理输入
    req.body.name = sanitizeInput(name.trim());
    if (description) {
        req.body.description = sanitizeInput(description.trim());
    }

    next();
};

// 更新学科验证规则组合
const validateUpdateSubject = [
    ...validateSubjectId,
    ...validateSubjectName,
    ...validateSubjectDescription,
    handleValidationErrors
];

// 获取学科详情验证规则组合
const validateGetSubject = [
    ...validateSubjectId,
    handleValidationErrors
];

// Content-Type验证中间件
const validateContentType = (req, res, next) => {
    // 只对POST和PUT请求验证Content-Type
    if (['POST', 'PUT'].includes(req.method)) {
        const contentType = req.headers['content-type'];

        if (!contentType || !contentType.includes('application/json')) {
            return res.status(415).json({
                success: false,
                message: '不支持的媒体类型，请使用 application/json',
                code: 'UNSUPPORTED_MEDIA_TYPE',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown'
            });
        }
    }
    next();
};

// 通用输入清理中间件
const sanitizeRequest = (req, res, next) => {
    // 清理请求体
    if (req.body && typeof req.body === 'object') {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        }
    }

    // 清理查询参数
    if (req.query && typeof req.query === 'object') {
        for (const key in req.query) {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeInput(req.query[key]);
            }
        }
    }

    next();
};

module.exports = {
    validateCreateSubject,
    validateUpdateSubject,
    validateGetSubject,
    sanitizeRequest,
    validateContentType,
    handleValidationErrors
};
