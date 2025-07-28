# 期末复习平台数据库设计

## 概述
本目录包含期末复习平台的SQLite数据库文件和相关脚本。

## 文件说明

### database.sqlite
主数据库文件，包含所有业务数据。

### init_database.sql
数据库初始化脚本，包含：
- subjects表的创建
- 索引的创建
- 测试数据的插入

### test_database.js
数据库连接和功能测试脚本。

## 数据库结构

### subjects表
学科管理表，用于存储所有学科信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 学科唯一标识 |
| name | VARCHAR(50) | UNIQUE NOT NULL | 学科名称 |
| description | TEXT | - | 学科描述 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 索引设计
- `idx_subjects_name`: 学科名称索引，优化按名称查询的性能
- `idx_subjects_created_at`: 创建时间索引，优化按时间排序的性能
- `sqlite_autoindex_subjects_1`: SQLite自动创建的唯一约束索引

## 测试数据
数据库包含5条测试数据：
1. 数学 - 高等数学、线性代数、概率论等数学相关课程
2. 计算机科学 - 数据结构、算法、操作系统、数据库等计算机课程
3. 英语 - 大学英语、英语听说、英语写作等英语课程
4. 物理 - 大学物理、理论力学、电磁学等物理课程
5. 化学 - 无机化学、有机化学、物理化学等化学课程

## 使用方法

### 重新初始化数据库
```bash
sqlite3 data/database.sqlite ".read data/init_database.sql"
```

### 查看表结构
```bash
sqlite3 data/database.sqlite ".schema subjects"
```

### 查看数据
```bash
sqlite3 data/database.sqlite "SELECT * FROM subjects;"
```

### 运行测试脚本
```bash
node data/test_database.js
```

## 性能优化
- 使用索引优化查询性能
- 学科名称限制在50字符以内
- 使用AUTOINCREMENT确保ID唯一性
- 创建时间和更新时间自动管理

## 扩展性考虑
数据库设计考虑了后续功能的扩展需求：
- subjects表为后续文件管理功能提供学科分类基础
- 预留description字段用于详细描述
- 时间戳字段支持数据审计和版本管理
