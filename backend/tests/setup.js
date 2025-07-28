// 测试环境配置文件
// 用于配置Playwright测试环境和数据库

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// 测试数据库路径
const TEST_DB_PATH = path.join(__dirname, '../data/test_database.sqlite');
const ORIGINAL_DB_PATH = path.join(__dirname, '../data/database.sqlite');

// 测试服务器配置
const TEST_SERVER_PORT = 3001;
const TEST_BASE_URL = `http://localhost:${TEST_SERVER_PORT}`;

// 测试前准备
async function setupTestEnvironment() {
    // 备份原始数据库
    if (fs.existsSync(ORIGINAL_DB_PATH)) {
        fs.copyFileSync(ORIGINAL_DB_PATH, `${ORIGINAL_DB_PATH}.backup`);
    }
    
    // 创建测试数据库
    if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
    }
    
    console.log('✅ 测试环境准备完成');
}

// 测试后清理
async function cleanupTestEnvironment() {
    // 删除测试数据库
    if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
    }
    
    // 恢复原始数据库
    if (fs.existsSync(`${ORIGINAL_DB_PATH}.backup`)) {
        fs.copyFileSync(`${ORIGINAL_DB_PATH}.backup`, ORIGINAL_DB_PATH);
        fs.unlinkSync(`${ORIGINAL_DB_PATH}.backup`);
    }
    
    console.log('✅ 测试环境清理完成');
}

// 测试数据
const testSubjects = [
    {
        name: '测试数学',
        description: '数学测试学科'
    },
    {
        name: '测试物理',
        description: '物理测试学科'
    },
    {
        name: '测试化学',
        description: '化学测试学科'
    }
];

module.exports = {
    setupTestEnvironment,
    cleanupTestEnvironment,
    testSubjects,
    TEST_BASE_URL,
    TEST_SERVER_PORT
};
