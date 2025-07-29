// 文件管理路由
// 定义文件上传、下载、管理相关的API端点

const express = require('express');
const router = express.Router();

// 导入multer配置
const { upload } = require('../config/multer');

// 导入服务和中间件
const fileService = require('../services/fileService');
const {
    validateSubjectId,
    validateFileId,
    validateFileUpload
} = require('../middleware/fileValidation');
const { handleValidationErrors } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/subjects/:id/upload
 * @desc    上传Markdown文件到指定学科
 * @access  Public
 * @param   {number} id - 学科ID
 * @param   {File} file - 上传的Markdown文件
 * @returns {Object} 上传结果和文件信息
 */
router.post('/subjects/:id/upload',
    validateSubjectId,
    handleValidationErrors,
    upload.single('file'),
    validateFileUpload,
    asyncHandler(async (req, res) => {
        const startTime = Date.now();
        const subjectId = req.params.id;
        const file = req.file;

        console.log(`📤 接收文件上传请求: 学科ID ${subjectId}, 文件 ${file.originalname}`);

        try {
            const result = await fileService.uploadFile(subjectId, file);

            const responseTime = Date.now() - startTime;
            console.log(`✅ 文件上传API响应: ${responseTime}ms`);

            res.status(201).json({
                ...result,
                requestId: req.headers['x-request-id'] || 'unknown',
                responseTime: `${responseTime}ms`
            });

        } catch (error) {
            console.error(`❌ 文件上传API错误:`, error.message);

            // 根据错误类型返回相应的HTTP状态码
            let statusCode = 500;
            let errorCode = 'UPLOAD_ERROR';

            if (error.code === 'SUBJECT_NOT_FOUND') {
                statusCode = 404;
                errorCode = error.code;
            } else if (error.code === 'DATABASE_ERROR') {
                statusCode = 500;
                errorCode = error.code;
            }

            res.status(statusCode).json({
                success: false,
                error: errorCode,
                message: error.message,
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown'
            });
        }
    })
);

/**
 * @route   GET /api/files/:fileId
 * @desc    根据文件ID获取文件信息和内容
 * @access  Public
 * @param   {number} fileId - 文件ID
 * @returns {Object} 文件信息和内容
 */
router.get('/files/:fileId',
    validateFileId,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const startTime = Date.now();
        const fileId = req.params.fileId;

        console.log(`📄 接收文件获取请求: 文件ID ${fileId}`);

        try {
            const result = await fileService.getFileById(fileId);

            const responseTime = Date.now() - startTime;
            console.log(`✅ 文件获取API响应: ${responseTime}ms`);

            res.json({
                ...result,
                requestId: req.headers['x-request-id'] || 'unknown',
                responseTime: `${responseTime}ms`
            });

        } catch (error) {
            console.error(`❌ 文件获取API错误:`, error.message);

            // 根据错误类型返回相应的HTTP状态码
            let statusCode = 500;
            let errorCode = 'GET_FILE_ERROR';

            if (error.code === 'FILE_NOT_FOUND') {
                statusCode = 404;
                errorCode = error.code;
            } else if (error.code === 'DATABASE_ERROR') {
                statusCode = 500;
                errorCode = error.code;
            }

            res.status(statusCode).json({
                success: false,
                error: errorCode,
                message: error.message,
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown'
            });
        }
    })
);

/**
 * @route   GET /api/files/:fileId/content
 * @desc    根据文件ID获取文件内容（专用于内容读取）
 * @access  Public
 * @param   {number} fileId - 文件ID
 * @returns {Object} 文件内容和基本信息
 */
router.get('/files/:fileId/content',
    validateFileId,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const startTime = Date.now();
        const fileId = req.params.fileId;

        console.log(`📖 接收文件内容获取请求: 文件ID ${fileId}`);

        try {
            const result = await fileService.getFileContent(fileId);

            const responseTime = Date.now() - startTime;
            console.log(`✅ 文件内容获取API响应: ${responseTime}ms`);

            res.json({
                ...result,
                requestId: req.headers['x-request-id'] || 'unknown',
                responseTime: `${responseTime}ms`
            });

        } catch (error) {
            console.error(`❌ 文件内容获取API错误:`, error.message);

            // 根据错误类型返回相应的HTTP状态码
            let statusCode = 500;
            let errorCode = 'GET_FILE_CONTENT_ERROR';

            if (error.code === 'FILE_NOT_FOUND') {
                statusCode = 404;
                errorCode = error.code;
            } else if (error.code === 'DATABASE_ERROR') {
                statusCode = 500;
                errorCode = error.code;
            }

            res.status(statusCode).json({
                success: false,
                error: errorCode,
                message: error.message,
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown'
            });
        }
    })
);

/**
 * @route   GET /api/subjects/:id/files
 * @desc    获取指定学科的所有文件列表
 * @access  Public
 * @param   {number} id - 学科ID
 * @returns {Object} 文件列表
 */
router.get('/subjects/:id/files',
    validateSubjectId,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const startTime = Date.now();
        const subjectId = req.params.id;

        console.log(`📋 接收文件列表请求: 学科ID ${subjectId}`);

        // 这个功能将在后续任务中实现
        res.status(501).json({
            success: false,
            error: 'NOT_IMPLEMENTED',
            message: '文件列表功能尚未实现，将在后续版本中提供',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    })
);

// 错误处理中间件 - 专门处理multer错误
router.use((error, req, res, next) => {
    console.error('🚨 文件路由错误:', error.message);

    // 处理multer特定错误
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'FILE_TOO_LARGE',
            message: '文件大小超过限制（最大10MB）',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            error: 'UNEXPECTED_FILE',
            message: '上传了意外的文件字段',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    if (error.message && error.message.includes('只支持Markdown文件上传')) {
        return res.status(400).json({
            success: false,
            error: 'INVALID_FILE_TYPE',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    // 传递给全局错误处理器
    next(error);
});

module.exports = router;
