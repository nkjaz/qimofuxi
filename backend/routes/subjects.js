// 学科管理路由
// 定义学科相关的API端点

const express = require('express');
const router = express.Router();

// 导入服务和中间件
const subjectService = require('../services/subjectService');
const {
    validateCreateSubject,
    validateGetSubject,
    sanitizeRequest,
    validateContentType
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// 应用输入清理中间件到所有路由
router.use(sanitizeRequest);

/**
 * @route   GET /api/subjects
 * @desc    获取所有学科列表
 * @access  Public
 * @returns {Object} 学科列表数据
 */
router.get('/', asyncHandler(async (req, res) => {
    const startTime = Date.now();

    const result = await subjectService.getAllSubjects();

    const responseTime = Date.now() - startTime;
    console.log(`📊 获取学科列表 - 响应时间: ${responseTime}ms`);

    res.json({
        ...result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        responseTime: `${responseTime}ms`
    });
}));

/**
 * @route   GET /api/subjects/:id
 * @desc    根据ID获取学科详情
 * @access  Public
 * @param   {number} id - 学科ID
 * @returns {Object} 学科详情数据
 */
router.get('/:id', validateGetSubject, asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;

    const result = await subjectService.getSubjectById(id);

    const responseTime = Date.now() - startTime;
    console.log(`📊 获取学科详情 ID:${id} - 响应时间: ${responseTime}ms`);

    res.json({
        ...result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        responseTime: `${responseTime}ms`
    });
}));

/**
 * @route   POST /api/subjects
 * @desc    创建新学科
 * @access  Public
 * @body    {string} name - 学科名称 (必填, 1-50字符)
 * @body    {string} description - 学科描述 (可选, 最多500字符)
 * @returns {Object} 创建的学科数据
 */
router.post('/', asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { name, description } = req.body;

    // 验证学科名称
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
            message: '学科名称长度必须在1-50个字符之间',
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }

    console.log(`📝 创建学科请求 - 名称: ${name}`);

    const result = await subjectService.createSubject({ name: name.trim(), description });

    const responseTime = Date.now() - startTime;
    console.log(`✅ 学科创建成功 ID:${result.data.id} - 响应时间: ${responseTime}ms`);

    res.status(201).json({
        ...result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        responseTime: `${responseTime}ms`
    });
}));

/**
 * @route   PUT /api/subjects/:id
 * @desc    更新学科信息
 * @access  Public
 * @param   {number} id - 学科ID
 * @body    {string} name - 学科名称 (必填, 1-50字符)
 * @body    {string} description - 学科描述 (可选, 最多500字符)
 * @returns {Object} 更新后的学科数据
 */
router.put('/:id', validateContentType, validateCreateSubject, asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;
    const { name, description } = req.body;

    console.log(`📝 更新学科请求 ID:${id} - 名称: ${name}`);

    const result = await subjectService.updateSubject(id, { name, description });

    const responseTime = Date.now() - startTime;
    console.log(`✅ 学科更新成功 ID:${id} - 响应时间: ${responseTime}ms`);

    res.json({
        ...result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        responseTime: `${responseTime}ms`
    });
}));

/**
 * @route   DELETE /api/subjects/:id
 * @desc    删除学科
 * @access  Public
 * @param   {number} id - 学科ID
 * @returns {Object} 删除结果
 */
router.delete('/:id', validateGetSubject, asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;

    console.log(`🗑️ 删除学科请求 ID:${id}`);

    const result = await subjectService.deleteSubject(id);

    const responseTime = Date.now() - startTime;
    console.log(`✅ 学科删除成功 ID:${id} - 响应时间: ${responseTime}ms`);

    res.json({
        ...result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        responseTime: `${responseTime}ms`
    });
}));

/**
 * @route   GET /api/subjects/stats/summary
 * @desc    获取学科统计信息
 * @access  Public
 * @returns {Object} 学科统计数据
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
    const startTime = Date.now();

    const result = await subjectService.getSubjectStats();

    const responseTime = Date.now() - startTime;
    console.log(`📊 获取学科统计 - 响应时间: ${responseTime}ms`);

    res.json({
        ...result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        responseTime: `${responseTime}ms`
    });
}));

module.exports = router;
