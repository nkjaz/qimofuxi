// Mock API服务器用于前后端数据联调测试
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟数据存储
let subjects = [
  {
    id: 1,
    name: '数学',
    description: '数学是研究数量、结构、变化、空间以及信息等概念的一门学科',
    created_at: '2025-01-28T10:00:00.000Z',
    updated_at: '2025-01-28T10:00:00.000Z'
  },
  {
    id: 2,
    name: '物理',
    description: '物理学是研究物质运动最一般规律和物质基本结构的学科',
    created_at: '2025-01-28T10:01:00.000Z',
    updated_at: '2025-01-28T10:01:00.000Z'
  }
];

let nextId = 3;

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 获取学科列表
app.get('/api/subjects', (req, res) => {
  console.log(`${new Date().toISOString()} - GET /api/subjects`);
  
  res.json({
    success: true,
    data: subjects,
    message: '获取学科列表成功',
    timestamp: new Date().toISOString()
  });
});

// 创建学科
app.post('/api/subjects', (req, res) => {
  console.log(`${new Date().toISOString()} - POST /api/subjects`, req.body);
  
  const { name, description } = req.body;
  
  // 简单验证
  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: '学科名称不能为空',
      timestamp: new Date().toISOString()
    });
  }
  
  // 创建新学科
  const newSubject = {
    id: nextId++,
    name: name.trim(),
    description: description ? description.trim() : '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  subjects.unshift(newSubject);
  
  res.status(201).json({
    success: true,
    data: newSubject,
    message: '学科创建成功',
    timestamp: new Date().toISOString()
  });
});

// 获取学科详情
app.get('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`${new Date().toISOString()} - GET /api/subjects/${id}`);
  
  const subject = subjects.find(s => s.id === id);
  
  if (!subject) {
    return res.status(404).json({
      success: false,
      message: '学科不存在',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: subject,
    message: '获取学科详情成功',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Mock API服务已启动`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  console.log(`📚 学科API: http://localhost:${PORT}/api/subjects`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
  console.log(`📊 初始数据: ${subjects.length} 个学科`);
});
