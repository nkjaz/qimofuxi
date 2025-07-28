// 学科API自动化测试
// 使用Playwright进行完整的API测试，包括正常场景、边界条件和错误场景

const { test, expect } = require('@playwright/test');
const { testSubjects } = require('../setup');

// 测试组：健康检查API
test.describe('健康检查API测试', () => {
    test('GET /health - 应该返回服务健康状态', async ({ request }) => {
        const startTime = Date.now();
        
        const response = await request.get('/health');
        const responseTime = Date.now() - startTime;
        
        // 验证响应状态
        expect(response.status()).toBe(200);
        
        // 验证响应时间 < 200ms
        expect(responseTime).toBeLessThan(200);
        
        // 验证响应内容
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('message', '期末复习平台API服务运行正常');
        expect(data).toHaveProperty('version', '1.0.0');
        expect(data).toHaveProperty('timestamp');
        
        console.log(`✅ 健康检查响应时间: ${responseTime}ms`);
    });
});

// 测试组：学科管理API - 正常场景
test.describe('学科管理API - 正常场景测试', () => {
    test('GET /api/subjects - 应该返回学科列表', async ({ request }) => {
        const startTime = Date.now();
        
        const response = await request.get('/api/subjects');
        const responseTime = Date.now() - startTime;
        
        // 验证响应状态
        expect(response.status()).toBe(200);
        
        // 验证响应时间
        expect(responseTime).toBeLessThan(200);
        
        // 验证响应格式
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('message', '获取学科列表成功');
        expect(data).toHaveProperty('timestamp');
        expect(data).toHaveProperty('requestId');
        expect(data).toHaveProperty('responseTime');
        
        // 验证数据结构
        expect(Array.isArray(data.data)).toBe(true);
        expect(typeof data.total).toBe('number');
        
        console.log(`✅ 获取学科列表响应时间: ${responseTime}ms, 学科数量: ${data.total}`);
    });
    
    test('POST /api/subjects - 应该成功创建学科', async ({ request }) => {
        const testSubject = {
            name: `测试学科_${Date.now()}`,
            description: '这是一个自动化测试创建的学科'
        };
        
        const startTime = Date.now();
        
        const response = await request.post('/api/subjects', {
            data: testSubject
        });
        const responseTime = Date.now() - startTime;
        
        // 验证响应状态
        expect(response.status()).toBe(201);
        
        // 验证响应时间
        expect(responseTime).toBeLessThan(200);
        
        // 验证响应格式
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('message', '创建学科成功');
        expect(data).toHaveProperty('timestamp');
        expect(data).toHaveProperty('requestId');
        expect(data).toHaveProperty('responseTime');
        
        // 验证创建的数据
        expect(data.data).toHaveProperty('name', testSubject.name);
        expect(data.data).toHaveProperty('description', testSubject.description);
        
        console.log(`✅ 创建学科响应时间: ${responseTime}ms`);
    });
    
    test('GET /api/subjects/:id - 应该返回指定学科详情', async ({ request }) => {
        // 先创建一个学科
        const testSubject = {
            name: `详情测试学科_${Date.now()}`,
            description: '用于测试获取详情的学科'
        };
        
        const createResponse = await request.post('/api/subjects', {
            data: testSubject
        });
        expect(createResponse.status()).toBe(201);
        
        // 获取学科列表找到刚创建的学科ID
        const listResponse = await request.get('/api/subjects');
        const listData = await listResponse.json();
        const createdSubject = listData.data.find(s => s.name === testSubject.name);
        expect(createdSubject).toBeDefined();
        
        // 测试获取详情
        const startTime = Date.now();
        
        const response = await request.get(`/api/subjects/${createdSubject.id}`);
        const responseTime = Date.now() - startTime;
        
        // 验证响应状态
        expect(response.status()).toBe(200);
        
        // 验证响应时间
        expect(responseTime).toBeLessThan(200);
        
        // 验证响应格式
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('message', '获取学科详情成功');
        
        // 验证学科详情
        expect(data.data).toHaveProperty('id', createdSubject.id);
        expect(data.data).toHaveProperty('name', testSubject.name);
        expect(data.data).toHaveProperty('description', testSubject.description);
        expect(data.data).toHaveProperty('created_at');
        expect(data.data).toHaveProperty('updated_at');
        
        console.log(`✅ 获取学科详情响应时间: ${responseTime}ms`);
    });
});

// 测试组：边界条件测试
test.describe('学科管理API - 边界条件测试', () => {
    test('POST /api/subjects - 空名称应该返回验证错误', async ({ request }) => {
        const response = await request.post('/api/subjects', {
            data: {
                name: '',
                description: '空名称测试'
            }
        });
        
        expect(response.status()).toBe(400);
        
        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data.message).toContain('学科名称不能为空');
    });
    
    test('POST /api/subjects - 超长名称应该返回验证错误', async ({ request }) => {
        const longName = 'a'.repeat(51); // 超过50字符限制
        
        const response = await request.post('/api/subjects', {
            data: {
                name: longName,
                description: '超长名称测试'
            }
        });
        
        expect(response.status()).toBe(400);
        
        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data.message).toContain('学科名称长度必须在1-50个字符之间');
    });
    
    test('POST /api/subjects - 重复名称应该返回错误', async ({ request }) => {
        const duplicateName = `重复测试学科_${Date.now()}`;
        
        // 第一次创建
        const firstResponse = await request.post('/api/subjects', {
            data: {
                name: duplicateName,
                description: '第一次创建'
            }
        });
        expect(firstResponse.status()).toBe(201);
        
        // 第二次创建相同名称
        const secondResponse = await request.post('/api/subjects', {
            data: {
                name: duplicateName,
                description: '第二次创建'
            }
        });
        
        expect(secondResponse.status()).toBe(400);
        
        const data = await secondResponse.json();
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('code', 'SUBJECT_NAME_EXISTS');
        expect(data.message).toContain('学科名称已存在');
    });
    
    test('POST /api/subjects - 特殊字符应该被正确处理', async ({ request }) => {
        const specialName = `特殊字符测试_${Date.now()}_!@#$%`;
        
        const response = await request.post('/api/subjects', {
            data: {
                name: specialName,
                description: '包含特殊字符的描述: <script>alert("test")</script>'
            }
        });
        
        // 应该被验证规则拒绝或正确清理
        if (response.status() === 400) {
            const data = await response.json();
            expect(data).toHaveProperty('success', false);
        } else {
            expect(response.status()).toBe(201);
        }
    });
});

// 测试组：错误场景测试
test.describe('学科管理API - 错误场景测试', () => {
    test('GET /api/subjects/999999 - 不存在的学科ID应该返回404', async ({ request }) => {
        const response = await request.get('/api/subjects/999999');
        
        expect(response.status()).toBe(404);
        
        const data = await response.json();
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('code', 'SUBJECT_NOT_FOUND');
        expect(data.message).toContain('学科不存在');
    });
    
    test('GET /api/subjects/invalid - 无效的学科ID应该返回400', async ({ request }) => {
        const response = await request.get('/api/subjects/invalid');
        
        expect(response.status()).toBe(400);
        
        const data = await response.json();
        expect(data).toHaveProperty('success', false);
    });
    
    test('POST /api/subjects - 无效的JSON应该返回400', async ({ request }) => {
        const response = await request.post('/api/subjects', {
            data: 'invalid json string'
        });
        
        expect(response.status()).toBe(400);
    });
    
    test('POST /api/subjects - 缺少Content-Type应该被正确处理', async ({ request }) => {
        const response = await request.post('/api/subjects', {
            headers: {
                'Content-Type': 'text/plain'
            },
            data: JSON.stringify({
                name: '测试学科',
                description: '测试描述'
            })
        });
        
        // 应该返回400或被正确处理
        expect([400, 415].includes(response.status())).toBe(true);
    });
});

// 测试组：性能测试
test.describe('学科管理API - 性能测试', () => {
    test('批量创建学科性能测试', async ({ request }) => {
        const batchSize = 10;
        const promises = [];
        
        const startTime = Date.now();
        
        for (let i = 0; i < batchSize; i++) {
            promises.push(
                request.post('/api/subjects', {
                    data: {
                        name: `批量测试学科_${Date.now()}_${i}`,
                        description: `批量测试描述 ${i}`
                    }
                })
            );
        }
        
        const responses = await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        
        // 验证所有请求都成功
        responses.forEach(response => {
            expect(response.status()).toBe(201);
        });
        
        // 验证平均响应时间
        const avgTime = totalTime / batchSize;
        expect(avgTime).toBeLessThan(500); // 平均每个请求不超过500ms
        
        console.log(`✅ 批量创建${batchSize}个学科总时间: ${totalTime}ms, 平均时间: ${avgTime}ms`);
    });
    
    test('获取学科列表性能测试', async ({ request }) => {
        const iterations = 20;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            const response = await request.get('/api/subjects');
            const responseTime = Date.now() - startTime;
            
            expect(response.status()).toBe(200);
            times.push(responseTime);
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxTime = Math.max(...times);
        
        expect(avgTime).toBeLessThan(100); // 平均响应时间不超过100ms
        expect(maxTime).toBeLessThan(200); // 最大响应时间不超过200ms
        
        console.log(`✅ ${iterations}次获取列表 - 平均时间: ${avgTime.toFixed(2)}ms, 最大时间: ${maxTime}ms`);
    });
});
