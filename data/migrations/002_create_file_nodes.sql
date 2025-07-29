-- 文件节点表迁移脚本
-- 创建file_nodes表支持文件树形结构存储
-- 迁移版本: 002
-- 创建时间: 2025-01-29

-- 创建file_nodes表
CREATE TABLE IF NOT EXISTS file_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    parent_id INTEGER,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('file', 'folder')),
    content TEXT,
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES file_nodes(id) ON DELETE CASCADE
);

-- 创建性能优化索引
CREATE INDEX IF NOT EXISTS idx_file_nodes_subject_parent ON file_nodes(subject_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_file_nodes_type ON file_nodes(type);
CREATE INDEX IF NOT EXISTS idx_file_nodes_name ON file_nodes(name);
CREATE INDEX IF NOT EXISTS idx_file_nodes_created_at ON file_nodes(created_at);

-- 插入测试数据验证表结构
INSERT OR IGNORE INTO file_nodes (subject_id, parent_id, name, type, content, file_path, file_size, mime_type) VALUES 
(1, NULL, '数学复习资料', 'folder', NULL, NULL, NULL, NULL),
(1, 1, '高等数学.md', 'file', '# 高等数学复习要点\n\n## 极限与连续\n\n### 极限的定义\n极限是微积分的基础概念...', 'uploads/1/高等数学.md', 1024, 'text/markdown'),
(2, NULL, '计算机科学资料', 'folder', NULL, NULL, NULL, NULL),
(2, 3, '数据结构.md', 'file', '# 数据结构与算法\n\n## 线性表\n\n### 顺序表\n顺序表是用一组地址连续的存储单元...', 'uploads/2/数据结构.md', 2048, 'text/markdown');

-- 验证数据插入和外键约束
SELECT 'File nodes table created successfully. Total file nodes:' as message, COUNT(*) as count FROM file_nodes;

-- 验证外键关联
SELECT 
    fn.name as file_name,
    s.name as subject_name,
    fn.type as node_type
FROM file_nodes fn
JOIN subjects s ON fn.subject_id = s.id
ORDER BY fn.subject_id, fn.id;
