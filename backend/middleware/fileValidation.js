// 文件上传验证中间件
// 文件类型、大小、安全性验证

const { param } = require('express-validator');
const path = require('path');
const fs = require('fs');

// 文件ID验证规则
const validateFileId = [
    param('fileId')
        .isInt({ min: 1 })
        .withMessage('文件ID必须是大于0的整数')
        .toInt()
];

// 学科ID验证规则（复用）
const validateSubjectId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('学科ID必须是大于0的整数')
        .toInt()
];

// 文件上传前验证中间件
const validateFileUpload = (req, res, next) => {
    // 检查是否有文件上传
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'NO_FILE_UPLOADED',
            message: '请选择要上传的文件',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    const file = req.file;
    console.log(`🔍 文件上传验证: ${file.originalname}`);

    // 验证文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.md', '.markdown'];
    
    if (!allowedExts.includes(ext)) {
        // 删除已上传的临时文件
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        return res.status(400).json({
            success: false,
            error: 'INVALID_FILE_TYPE',
            message: `只支持Markdown文件上传 (.md, .markdown)。当前文件类型: ${ext}`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    // 验证MIME类型
    const allowedMimes = [
        'text/markdown',
        'text/x-markdown',
        'text/plain',
        'application/octet-stream'
    ];
    
    if (!allowedMimes.includes(file.mimetype)) {
        // 删除已上传的临时文件
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        return res.status(400).json({
            success: false,
            error: 'INVALID_MIME_TYPE',
            message: `文件MIME类型不支持: ${file.mimetype}`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    // 验证文件大小（10MB限制）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        // 删除已上传的临时文件
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        return res.status(400).json({
            success: false,
            error: 'FILE_TOO_LARGE',
            message: `文件大小超过限制。最大允许: ${maxSize / 1024 / 1024}MB，当前文件: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    // 验证文件名安全性
    const filename = file.originalname;
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) {
        // 删除已上传的临时文件
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        return res.status(400).json({
            success: false,
            error: 'INVALID_FILENAME',
            message: '文件名包含不安全字符，请重命名后重试',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    // 验证文件名长度
    if (filename.length > 255) {
        // 删除已上传的临时文件
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        return res.status(400).json({
            success: false,
            error: 'FILENAME_TOO_LONG',
            message: '文件名过长，请使用较短的文件名（最大255字符）',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    console.log(`✅ 文件验证通过: ${filename} (${(file.size / 1024).toFixed(2)}KB)`);
    next();
};

// 文件路径安全检查
const validateFilePath = (filePath) => {
    // 检查路径遍历攻击
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..') || normalizedPath.startsWith('/') || normalizedPath.includes('\\..\\')) {
        throw new Error('文件路径不安全，包含路径遍历字符');
    }
    
    return normalizedPath;
};

// 清理临时文件的工具函数
const cleanupTempFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ 清理临时文件: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ 清理临时文件失败: ${filePath}`, error.message);
    }
};

module.exports = {
    validateFileId,
    validateSubjectId,
    validateFileUpload,
    validateFilePath,
    cleanupTempFile
};
