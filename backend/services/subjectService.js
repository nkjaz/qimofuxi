// 学科业务逻辑服务
// 处理学科相关的数据库操作和业务逻辑

const { getDatabase, saveDatabase } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class SubjectService {
    constructor() {
        this.db = null;
    }

    // 确保数据库连接可用
    async ensureConnection() {
        if (!this.db) {
            this.db = await getDatabase();
            console.log('✅ 学科服务数据库连接就绪');
        }
        return this.db;
    }

    // 获取所有学科
    async getAllSubjects() {
        try {
            const db = await this.ensureConnection();
            const sql = `SELECT id, name, description, created_at, updated_at FROM subjects ORDER BY created_at DESC`;

            const result = db.exec(sql);
            let subjects = [];

            if (result.length > 0 && result[0].values) {
                const columns = result[0].columns;
                subjects = result[0].values.map(row => {
                    const subject = {};
                    columns.forEach((col, index) => {
                        subject[col] = row[index];
                    });
                    return subject;
                });
            }

            return {
                success: true,
                data: subjects,
                total: subjects.length,
                message: '获取学科列表成功'
            };
        } catch (error) {
            console.error('❌ 获取学科列表失败:', error.message);
            throw new AppError('获取学科列表失败', 500, 'DATABASE_ERROR');
        }
    }

    // 根据ID获取学科
    async getSubjectById(id) {
        try {
            const db = await this.ensureConnection();
            const sql = `SELECT id, name, description, created_at, updated_at FROM subjects WHERE id = ?`;

            const stmt = db.prepare(sql);
            const result = stmt.getAsObject([id]);
            stmt.free();

            // 检查结果是否为空或没有id字段
            if (!result || !result.id || Object.keys(result).length === 0) {
                throw new AppError('学科不存在', 404, 'SUBJECT_NOT_FOUND');
            }

            return {
                success: true,
                data: result,
                message: '获取学科详情成功'
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('❌ 获取学科详情失败:', error.message);
            throw new AppError('获取学科详情失败', 500, 'DATABASE_ERROR');
        }
    }

    // 创建新学科
    async createSubject(subjectData) {
        try {
            const { name, description = '' } = subjectData;
            const db = await this.ensureConnection();

            // 检查学科名称是否已存在
            const checkSql = `SELECT COUNT(*) as count FROM subjects WHERE name = ?`;
            const checkStmt = db.prepare(checkSql);
            const result = checkStmt.getAsObject([name]);
            checkStmt.free();

            if (result && result.count > 0) {
                throw new AppError('学科名称已存在', 400, 'SUBJECT_NAME_EXISTS');
            }

            // 创建新学科
            const insertSql = `INSERT INTO subjects (name, description) VALUES (?, ?)`;
            const insertStmt = db.prepare(insertSql);
            insertStmt.run([name, description]);
            insertStmt.free();

            // 保存数据库
            saveDatabase();

            // 获取创建的学科详情 (简化版本，返回基本信息)
            return {
                success: true,
                data: { name, description },
                message: '创建学科成功'
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('❌ 创建学科失败:', error.message);
            throw new AppError('创建学科失败', 500, 'DATABASE_ERROR');
        }
    }

}

// 创建单例实例
const subjectService = new SubjectService();

module.exports = subjectService;
