// 文件管理服务
// 处理文件上传、存储、检索等业务逻辑

const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../config/database');
const { validateFilePath, cleanupTempFile } = require('../middleware/fileValidation');

class FileService {
    constructor() {
        this.uploadsDir = path.join(process.cwd(), 'uploads');
        this.tempDir = path.join(this.uploadsDir, 'temp');

        // 确保上传目录存在
        this.ensureDirectoryExists(this.uploadsDir);
        this.ensureDirectoryExists(this.tempDir);
    }

    // 确保目录存在
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`📁 创建目录: ${dirPath}`);
        }
    }

    // 上传文件到指定学科
    async uploadFile(subjectId, file) {
        const startTime = Date.now();
        console.log(`📤 开始上传文件: ${file.originalname} 到学科 ${subjectId}`);

        try {
            // 验证学科是否存在
            await this.validateSubjectExists(subjectId);

            // 创建学科专用目录
            const subjectDir = path.join(this.uploadsDir, subjectId.toString());
            this.ensureDirectoryExists(subjectDir);

            // 生成安全的文件名
            const safeFileName = this.generateSafeFileName(file.originalname);
            const finalPath = path.join(subjectDir, safeFileName);

            // 读取文件内容
            const content = fs.readFileSync(file.path, 'utf8');

            // 移动文件到最终位置
            fs.copyFileSync(file.path, finalPath);

            // 保存文件信息到数据库
            const fileRecord = await this.saveFileRecord({
                subjectId: parseInt(subjectId),
                name: safeFileName,
                originalName: file.originalname,
                content: content,
                filePath: path.relative(process.cwd(), finalPath),
                fileSize: file.size,
                mimeType: file.mimetype
            });

            // 清理临时文件
            cleanupTempFile(file.path);

            const responseTime = Date.now() - startTime;
            console.log(`✅ 文件上传成功: ${safeFileName} (${responseTime}ms)`);

            return {
                success: true,
                message: '文件上传成功',
                data: {
                    id: fileRecord.id,
                    name: fileRecord.name,
                    originalName: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype,
                    subjectId: parseInt(subjectId),
                    uploadTime: fileRecord.created_at
                },
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`
            };

        } catch (error) {
            // 清理临时文件
            cleanupTempFile(file.path);

            console.error(`❌ 文件上传失败: ${error.message}`);
            throw error;
        }
    }

    // 验证学科是否存在
    async validateSubjectExists(subjectId) {
        const database = await getDatabase();

        try {
            const result = database.exec(
                'SELECT id FROM subjects WHERE id = ?',
                [parseInt(subjectId)]
            );

            if (!result.length || !result[0].values.length) {
                const error = new Error(`学科不存在 (ID: ${subjectId})`);
                error.code = 'SUBJECT_NOT_FOUND';
                error.statusCode = 404;
                throw error;
            }

            return true;
        } catch (error) {
            if (error.code === 'SUBJECT_NOT_FOUND') {
                throw error;
            }

            const dbError = new Error('验证学科存在性时发生数据库错误');
            dbError.code = 'DATABASE_ERROR';
            dbError.statusCode = 500;
            dbError.originalError = error;
            throw dbError;
        }
    }

    // 生成安全的文件名
    generateSafeFileName(originalName) {
        // 获取文件扩展名
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);

        // 清理文件名，移除不安全字符
        const safeName = baseName
            .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
            .replace(/\s+/g, '_')
            .substring(0, 200); // 限制长度

        // 添加时间戳避免冲突
        const timestamp = Date.now();

        return `${safeName}_${timestamp}${ext}`;
    }

    // 保存文件记录到数据库
    async saveFileRecord(fileData) {
        const database = await getDatabase();

        try {
            const insertSQL = `
                INSERT INTO file_nodes (
                    subject_id, parent_id, name, type, content, 
                    file_path, file_size, mime_type, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;

            database.run(insertSQL, [
                fileData.subjectId,
                null, // parent_id为null表示根级文件
                fileData.name,
                'file',
                fileData.content,
                fileData.filePath,
                fileData.fileSize,
                fileData.mimeType
            ]);

            // 获取插入的记录ID
            const result = database.exec('SELECT last_insert_rowid() as id');
            const fileId = result[0].values[0][0];

            // 获取完整的文件记录
            const selectResult = database.exec(
                'SELECT * FROM file_nodes WHERE id = ?',
                [fileId]
            );

            if (!selectResult.length || !selectResult[0].values.length) {
                throw new Error('无法获取已插入的文件记录');
            }

            const columns = selectResult[0].columns;
            const values = selectResult[0].values[0];
            const record = {};

            columns.forEach((col, index) => {
                record[col] = values[index];
            });

            console.log(`💾 文件记录已保存到数据库: ID ${fileId}`);
            return record;

        } catch (error) {
            console.error('❌ 保存文件记录失败:', error.message);

            const dbError = new Error('保存文件信息到数据库时发生错误');
            dbError.code = 'DATABASE_ERROR';
            dbError.statusCode = 500;
            dbError.originalError = error;
            throw dbError;
        }
    }

    // 根据文件ID获取文件内容（专用于内容读取）
    async getFileContent(fileId) {
        const database = await getDatabase();

        try {
            const result = database.exec(
                'SELECT id, name, content, type, file_path, file_size, mime_type, created_at, updated_at FROM file_nodes WHERE id = ? AND type = "file"',
                [parseInt(fileId)]
            );

            if (!result.length || !result[0].values.length) {
                const error = new Error(`文件不存在 (ID: ${fileId})`);
                error.code = 'FILE_NOT_FOUND';
                error.statusCode = 404;
                throw error;
            }

            const columns = result[0].columns;
            const values = result[0].values[0];
            const record = {};

            columns.forEach((col, index) => {
                record[col] = values[index];
            });

            // 验证文件路径安全性
            if (record.file_path) {
                const safePath = validateFilePath(record.file_path);
                record.file_path = safePath;
            }

            console.log(`📄 获取文件内容: ${record.name} (ID: ${fileId})`);

            return {
                success: true,
                message: '获取文件内容成功',
                data: {
                    id: record.id,
                    name: record.name,
                    content: record.content || '', // 确保content字段存在
                    type: record.type,
                    filePath: record.file_path,
                    fileSize: record.file_size,
                    mimeType: record.mime_type,
                    createdAt: record.created_at,
                    updatedAt: record.updated_at
                },
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            if (error.code === 'FILE_NOT_FOUND') {
                throw error;
            }

            console.error('❌ 获取文件内容失败:', error.message);

            const dbError = new Error('获取文件内容时发生数据库错误');
            dbError.code = 'DATABASE_ERROR';
            dbError.statusCode = 500;
            dbError.originalError = error;
            throw dbError;
        }
    }

    // 根据文件ID获取文件信息
    async getFileById(fileId) {
        const database = await getDatabase();

        try {
            const result = database.exec(
                'SELECT * FROM file_nodes WHERE id = ? AND type = "file"',
                [parseInt(fileId)]
            );

            if (!result.length || !result[0].values.length) {
                const error = new Error(`文件不存在 (ID: ${fileId})`);
                error.code = 'FILE_NOT_FOUND';
                error.statusCode = 404;
                throw error;
            }

            const columns = result[0].columns;
            const values = result[0].values[0];
            const record = {};

            columns.forEach((col, index) => {
                record[col] = values[index];
            });

            return {
                success: true,
                message: '获取文件信息成功',
                data: record,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            if (error.code === 'FILE_NOT_FOUND') {
                throw error;
            }

            const dbError = new Error('获取文件信息时发生数据库错误');
            dbError.code = 'DATABASE_ERROR';
            dbError.statusCode = 500;
            dbError.originalError = error;
            throw dbError;
        }
    }
}

module.exports = new FileService();
