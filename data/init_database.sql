-- 期末复习平台数据库初始化脚本
-- 创建subjects表用于学科管理

-- 创建subjects表
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建性能优化索引
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);
CREATE INDEX IF NOT EXISTS idx_subjects_created_at ON subjects(created_at);

-- 插入测试数据
INSERT OR IGNORE INTO subjects (name, description) VALUES 
('数学', '高等数学、线性代数、概率论等数学相关课程'),
('计算机科学', '数据结构、算法、操作系统、数据库等计算机课程'),
('英语', '大学英语、英语听说、英语写作等英语课程'),
('物理', '大学物理、理论力学、电磁学等物理课程'),
('化学', '无机化学、有机化学、物理化学等化学课程');

-- 验证数据插入
SELECT 'Database initialization completed. Total subjects:' as message, COUNT(*) as count FROM subjects;
