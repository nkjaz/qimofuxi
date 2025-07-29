// Multer文件上传中间件配置
// 支持Markdown文件上传，包含安全性检查和文件大小限制

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 文件存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 根据学科ID创建存储目录
        const subjectId = req.params.id || req.params.subjectId;
        const uploadDir = path.join(__dirname, '../../uploads', subjectId.toString());
        
        // 确保目录存在
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log(`📁 创建上传目录: ${uploadDir}`);
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 保持原始文件名，确保UTF-8编码
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        
        // 添加时间戳避免文件名冲突
        const timestamp = Date.now();
        const ext = path.extname(originalName);
        const basename = path.basename(originalName, ext);
        const filename = `${basename}_${timestamp}${ext}`;
        
        console.log(`📄 文件上传: ${originalName} -> ${filename}`);
        cb(null, filename);
    }
});

// 文件过滤器 - 只允许Markdown文件
const fileFilter = (req, file, cb) => {
    console.log(`🔍 文件类型检查: ${file.originalname}, MIME: ${file.mimetype}`);
    
    // 检查文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.md', '.markdown'];
    
    // 检查MIME类型
    const allowedMimes = [
        'text/markdown',
        'text/x-markdown', 
        'text/plain',
        'application/octet-stream' // 某些系统可能将.md识别为此类型
    ];
    
    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
        console.log(`✅ 文件类型验证通过: ${file.originalname}`);
        cb(null, true);
    } else {
        console.log(`❌ 文件类型验证失败: ${file.originalname}`);
        const error = new Error(`只支持Markdown文件上传 (.md, .markdown)。当前文件: ${file.originalname}`);
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false);
    }
};

// Multer配置选项
const multerConfig = {
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
        files: 1 // 单文件上传
    }
};

// 创建multer实例
const upload = multer(multerConfig);

// 错误处理中间件
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error('❌ Multer错误:', error.message);
        
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    error: 'FILE_TOO_LARGE',
                    message: '文件大小超过限制 (最大10MB)'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    error: 'TOO_MANY_FILES',
                    message: '只能上传单个文件'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    error: 'UNEXPECTED_FIELD',
                    message: '意外的文件字段'
                });
            default:
                return res.status(400).json({
                    success: false,
                    error: 'UPLOAD_ERROR',
                    message: `文件上传错误: ${error.message}`
                });
        }
    } else if (error && error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            success: false,
            error: 'INVALID_FILE_TYPE',
            message: error.message
        });
    }
    
    next(error);
};

// 创建上传目录结构
const createUploadDirectories = () => {
    const baseUploadDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(baseUploadDir)) {
        fs.mkdirSync(baseUploadDir, { recursive: true });
        console.log(`📁 创建基础上传目录: ${baseUploadDir}`);
    }
    
    // 创建临时目录
    const tempDir = path.join(baseUploadDir, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log(`📁 创建临时目录: ${tempDir}`);
    }
};

// 初始化上传目录
createUploadDirectories();

module.exports = {
    upload,
    handleMulterError,
    createUploadDirectories,
    multerConfig
};
