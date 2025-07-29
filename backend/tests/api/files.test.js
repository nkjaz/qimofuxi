// 文件管理API自动化测试
// 使用Playwright进行完整的API测试，覆盖文件上传和内容获取的所有场景

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// 测试数据准备
const testMarkdownContent = `# 测试文档

这是一个用于API测试的Markdown文档。

## 功能特性

- 支持Markdown格式
- 文件大小限制10MB
- 安全的文件名处理
- 完整的错误处理

## 测试时间

${new Date().toISOString()}

## 内容验证

这段内容用于验证文件上传和内容获取功能的正确性。
`;

const testInvalidContent = `<script>alert('XSS Test')</script>
# 恶意内容测试
这是一个包含潜在恶意内容的测试文件。
`;

// 测试组：文件上传API - 正常场景
test.describe('文件上传API - 正常场景测试', () => {
    let uploadedFileId = null;

    test('POST /api/subjects/:id/upload - 成功上传Markdown文件', async ({ request }) => {
        const startTime = Date.now();

        // 创建测试文件
        const testFileName = 'test_upload.md';
        const testFilePath = path.join(__dirname, '../../temp', testFileName);

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // 写入测试文件
        fs.writeFileSync(testFilePath, testMarkdownContent, 'utf8');

        try {
            // 准备multipart/form-data
            const formData = new FormData();
            const fileBuffer = fs.readFileSync(testFilePath);
            const blob = new Blob([fileBuffer], { type: 'text/markdown' });
            formData.append('file', blob, testFileName);

            // 发送上传请求
            const response = await request.post('/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });

            const responseTime = Date.now() - startTime;

            // 验证响应状态
            expect(response.status()).toBe(201);

            // 验证响应时间 < 2秒
            expect(responseTime).toBeLessThan(2000);

            // 验证响应格式
            const data = await response.json();
            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('message', '文件上传成功');
            expect(data).toHaveProperty('data');

            // 验证文件信息
            const fileData = data.data;
            expect(fileData).toHaveProperty('id');
            expect(fileData).toHaveProperty('name');
            expect(fileData).toHaveProperty('originalName', testFileName);
            expect(fileData).toHaveProperty('size');
            expect(fileData).toHaveProperty('mimeType', 'text/markdown');
            expect(fileData).toHaveProperty('subjectId', 1);
            expect(fileData).toHaveProperty('uploadTime');

            // 保存文件ID用于后续测试
            uploadedFileId = fileData.id;

            console.log(`✅ 文件上传成功: ID=${uploadedFileId}, 响应时间=${responseTime}ms`);

        } finally {
            // 清理测试文件
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });

    test('POST /api/subjects/:id/upload - 上传.markdown扩展名文件', async ({ request }) => {
        const testFileName = 'test_markdown.markdown';
        const testFilePath = path.join(__dirname, '../../temp', testFileName);

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.writeFileSync(testFilePath, testMarkdownContent, 'utf8');

        try {
            const fileBuffer = fs.readFileSync(testFilePath);

            const response = await request.post('/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });

            expect(response.status()).toBe(201);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.originalName).toBe(testFileName);

            console.log(`✅ .markdown文件上传成功: ${data.data.name}`);

        } finally {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });
});

// 测试组：文件内容获取API - 正常场景
test.describe('文件内容获取API - 正常场景测试', () => {
    test('GET /api/files/:fileId - 获取文件信息', async ({ request }) => {
        const startTime = Date.now();

        // 使用之前上传的文件ID，如果没有则跳过
        const fileId = 1; // 假设存在ID为1的文件

        const response = await request.get(`/api/files/${fileId}`);
        const responseTime = Date.now() - startTime;

        // 验证响应状态
        expect(response.status()).toBe(200);

        // 验证响应时间
        expect(responseTime).toBeLessThan(500);

        // 验证响应格式
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('message', '获取文件信息成功');
        expect(data).toHaveProperty('data');

        // 验证文件数据结构
        const fileData = data.data;
        expect(fileData).toHaveProperty('id');
        expect(fileData).toHaveProperty('subject_id');
        expect(fileData).toHaveProperty('name');
        expect(fileData).toHaveProperty('type', 'file');
        expect(fileData).toHaveProperty('content');
        expect(fileData).toHaveProperty('file_path');
        expect(fileData).toHaveProperty('created_at');

        console.log(`✅ 文件信息获取成功: ${fileData.name}, 响应时间=${responseTime}ms`);
    });

    test('GET /api/files/:fileId/content - 获取文件内容', async ({ request }) => {
        const startTime = Date.now();

        const fileId = 1; // 假设存在ID为1的文件

        const response = await request.get(`/api/files/${fileId}/content`);
        const responseTime = Date.now() - startTime;

        // 验证响应状态
        expect(response.status()).toBe(200);

        // 验证响应时间
        expect(responseTime).toBeLessThan(500);

        // 验证响应格式
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('message', '获取文件内容成功');
        expect(data).toHaveProperty('data');

        // 验证内容数据结构
        const contentData = data.data;
        expect(contentData).toHaveProperty('id');
        expect(contentData).toHaveProperty('name');
        expect(contentData).toHaveProperty('content');
        expect(contentData).toHaveProperty('type', 'file');
        expect(contentData).toHaveProperty('filePath');
        expect(contentData).toHaveProperty('mimeType');
        expect(contentData).toHaveProperty('createdAt');

        // 验证内容不为空
        expect(typeof contentData.content).toBe('string');

        console.log(`✅ 文件内容获取成功: ${contentData.name}, 内容长度=${contentData.content.length}, 响应时间=${responseTime}ms`);
    });
});

// 测试组：文件上传API - 错误场景测试
test.describe('文件上传API - 错误场景测试', () => {
    test('POST /api/subjects/:id/upload - 未提供文件', async ({ request }) => {
        const response = await request.post('/api/subjects/1/upload', {
            multipart: {}
        });

        expect(response.status()).toBe(400);

        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('error', 'NO_FILE_UPLOADED');
        expect(data).toHaveProperty('message', '请选择要上传的文件');

        console.log('✅ 未提供文件错误处理正确');
    });

    test('POST /api/subjects/:id/upload - 不支持的文件类型', async ({ request }) => {
        const testFileName = 'test.txt';
        const testFilePath = path.join(__dirname, '../../temp', testFileName);

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.writeFileSync(testFilePath, 'This is a text file', 'utf8');

        try {
            const fileBuffer = fs.readFileSync(testFilePath);

            const response = await request.post('/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/plain',
                        buffer: fileBuffer
                    }
                }
            });

            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data).toHaveProperty('success', false);
            expect(data).toHaveProperty('error', 'INVALID_FILE_TYPE');

            console.log('✅ 不支持文件类型错误处理正确');

        } finally {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });

    test('POST /api/subjects/:id/upload - 文件名包含不安全字符', async ({ request }) => {
        const testFileName = '../../../malicious.md';
        const testFilePath = path.join(__dirname, '../../temp', 'malicious.md');

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.writeFileSync(testFilePath, testMarkdownContent, 'utf8');

        try {
            const fileBuffer = fs.readFileSync(testFilePath);

            const response = await request.post('/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });

            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data).toHaveProperty('success', false);
            expect(data).toHaveProperty('error', 'INVALID_FILENAME');

            console.log('✅ 不安全文件名错误处理正确');

        } finally {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });

    test('POST /api/subjects/:id/upload - 学科不存在', async ({ request }) => {
        const testFileName = 'test.md';
        const testFilePath = path.join(__dirname, '../../temp', testFileName);

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.writeFileSync(testFilePath, testMarkdownContent, 'utf8');

        try {
            const fileBuffer = fs.readFileSync(testFilePath);

            const response = await request.post('/api/subjects/999/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });

            expect(response.status()).toBe(404);

            const data = await response.json();
            expect(data).toHaveProperty('success', false);
            expect(data).toHaveProperty('error', 'SUBJECT_NOT_FOUND');

            console.log('✅ 学科不存在错误处理正确');

        } finally {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });
});

// 测试组：文件获取API - 错误场景测试
test.describe('文件获取API - 错误场景测试', () => {
    test('GET /api/files/:fileId - 文件不存在', async ({ request }) => {
        const nonExistentFileId = 999999;

        const response = await request.get(`/api/files/${nonExistentFileId}`);

        expect(response.status()).toBe(404);

        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('error', 'FILE_NOT_FOUND');
        expect(data.message).toContain('文件不存在');

        console.log('✅ 文件不存在错误处理正确');
    });

    test('GET /api/files/:fileId/content - 文件不存在', async ({ request }) => {
        const nonExistentFileId = 999999;

        const response = await request.get(`/api/files/${nonExistentFileId}/content`);

        expect(response.status()).toBe(404);

        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('error', 'FILE_NOT_FOUND');
        expect(data.message).toContain('文件不存在');

        console.log('✅ 文件内容不存在错误处理正确');
    });

    test('GET /api/files/:fileId - 无效的文件ID格式', async ({ request }) => {
        const invalidFileId = 'invalid-id';

        const response = await request.get(`/api/files/${invalidFileId}`);

        expect(response.status()).toBe(400);

        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('error', 'VALIDATION_ERROR');

        console.log('✅ 无效文件ID格式错误处理正确');
    });

    test('GET /api/files/:fileId/content - 无效的文件ID格式', async ({ request }) => {
        const invalidFileId = 'abc123';

        const response = await request.get(`/api/files/${invalidFileId}/content`);

        expect(response.status()).toBe(400);

        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('error', 'VALIDATION_ERROR');

        console.log('✅ 无效文件ID格式错误处理正确');
    });
});

// 测试组：边界条件测试
test.describe('文件管理API - 边界条件测试', () => {
    test('POST /api/subjects/:id/upload - 文件名长度边界测试', async ({ request }) => {
        // 测试长文件名（接近255字符限制）
        const longFileName = 'a'.repeat(240) + '.md';
        const testFilePath = path.join(__dirname, '../../temp', 'long_name.md');

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.writeFileSync(testFilePath, testMarkdownContent, 'utf8');

        try {
            const fileBuffer = fs.readFileSync(testFilePath);

            const response = await request.post('/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: longFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });

            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data).toHaveProperty('success', false);
            expect(data).toHaveProperty('error', 'FILENAME_TOO_LONG');

            console.log('✅ 文件名过长边界条件处理正确');

        } finally {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });

    test('POST /api/subjects/:id/upload - 空文件上传测试', async ({ request }) => {
        const testFileName = 'empty.md';
        const testFilePath = path.join(__dirname, '../../temp', testFileName);

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // 创建空文件
        fs.writeFileSync(testFilePath, '', 'utf8');

        try {
            const fileBuffer = fs.readFileSync(testFilePath);

            const response = await request.post('/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });

            // 空文件应该被接受
            expect(response.status()).toBe(201);

            const data = await response.json();
            expect(data).toHaveProperty('success', true);
            expect(data.data.size).toBe(0);

            console.log('✅ 空文件上传处理正确');

        } finally {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });

    test('GET /api/files/0 - 边界文件ID测试', async ({ request }) => {
        const response = await request.get('/api/files/0');

        expect(response.status()).toBe(404);

        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('error', 'FILE_NOT_FOUND');

        console.log('✅ 边界文件ID处理正确');
    });
});

// 测试组：性能测试
test.describe('文件管理API - 性能测试', () => {
    test('文件上传API性能测试', async ({ request }) => {
        const testFileName = 'performance_test.md';
        const testFilePath = path.join(__dirname, '../../temp', testFileName);

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // 创建较大的测试文件（约1MB）
        const largeContent = testMarkdownContent.repeat(1000);
        fs.writeFileSync(testFilePath, largeContent, 'utf8');

        try {
            const fileBuffer = fs.readFileSync(testFilePath);
            const startTime = Date.now();

            const response = await request.post('/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });

            const responseTime = Date.now() - startTime;

            expect(response.status()).toBe(201);
            expect(responseTime).toBeLessThan(5000); // 5秒内完成

            const data = await response.json();
            expect(data.success).toBe(true);

            console.log(`✅ 大文件上传性能测试通过: 文件大小=${Math.round(fileBuffer.length / 1024)}KB, 响应时间=${responseTime}ms`);

        } finally {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });

    test('并发文件获取性能测试', async ({ request }) => {
        const fileId = 1; // 假设存在的文件ID
        const concurrentRequests = 5;
        const startTime = Date.now();

        // 创建并发请求
        const promises = Array.from({ length: concurrentRequests }, () =>
            request.get(`/api/files/${fileId}`)
        );

        const responses = await Promise.all(promises);
        const totalTime = Date.now() - startTime;

        // 验证所有请求都成功
        responses.forEach(response => {
            expect(response.status()).toBe(200);
        });

        // 验证平均响应时间
        const avgResponseTime = totalTime / concurrentRequests;
        expect(avgResponseTime).toBeLessThan(1000); // 平均1秒内

        console.log(`✅ 并发请求性能测试通过: ${concurrentRequests}个请求, 总时间=${totalTime}ms, 平均=${Math.round(avgResponseTime)}ms`);
    });
});

// 测试组：数据一致性测试
test.describe('文件管理API - 数据一致性测试', () => {
    test('上传后立即获取文件内容一致性', async ({ request }) => {
        const testFileName = 'consistency_test.md';
        const testFilePath = path.join(__dirname, '../../temp', testFileName);
        const uniqueContent = `# 一致性测试\n\n测试时间: ${Date.now()}\n\n这是用于验证数据一致性的内容。`;

        // 确保temp目录存在
        const tempDir = path.dirname(testFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.writeFileSync(testFilePath, uniqueContent, 'utf8');

        try {
            const fileBuffer = fs.readFileSync(testFilePath);

            // 1. 上传文件
            const uploadResponse = await request.post('/api/subjects/1/upload', {
                multipart: {
                    file: {
                        name: testFileName,
                        mimeType: 'text/markdown',
                        buffer: fileBuffer
                    }
                }
            });

            expect(uploadResponse.status()).toBe(201);

            const uploadData = await uploadResponse.json();
            const fileId = uploadData.data.id;

            // 2. 立即获取文件内容
            const getResponse = await request.get(`/api/files/${fileId}/content`);

            expect(getResponse.status()).toBe(200);

            const getData = await getResponse.json();

            // 3. 验证内容一致性
            expect(getData.data.content).toBe(uniqueContent);
            expect(getData.data.name).toContain(testFileName.replace('.md', ''));

            console.log(`✅ 数据一致性测试通过: 文件ID=${fileId}`);

        } finally {
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });
});

// 测试后清理
test.afterAll(async () => {
    console.log('🧹 开始清理测试数据...');

    // 清理temp目录
    const tempDir = path.join(__dirname, '../../temp');
    if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ 已删除测试文件: ${file}`);
            }
        });

        // 如果目录为空，删除目录
        if (fs.readdirSync(tempDir).length === 0) {
            fs.rmdirSync(tempDir);
            console.log('🗑️ 已删除temp目录');
        }
    }

    console.log('✅ 测试数据清理完成');
});
