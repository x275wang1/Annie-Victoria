const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3001;

// 配置存储上传的照片
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// 中间件
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 确保数据目录存在
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// 初始化数据文件
const initDataFile = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
};

// 初始化所有数据文件
['memories.json', 'diaries.json', 'todos.json', 'messages.json', 'likes.json'].forEach(initDataFile);

// 辅助函数：读取JSON数据
const readData = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// 辅助函数：写入JSON数据
const writeData = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// 计算相识天数
const calculateDaysTogether = () => {
  const startDate = new Date('2021-04-01');
  const now = new Date();
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// 主页路由
app.get('/', (req, res) => {
  try {
    const days = calculateDaysTogether();
    const memories = readData('memories.json');
    const diaries = readData('diaries.json');
    const todos = readData('todos.json');
    const messages = readData('messages.json');
    const likes = readData('likes.json');
    
    res.render('index', {
      days,
      memories,
      diaries,
      todos,
      messages,
      likes
    });
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).send('加载数据时出错');
  }
});

// 上传照片
app.post('/memories', upload.single('photo'), (req, res) => {
  try {
    const memories = readData('memories.json');
    const newMemory = {
      id: Date.now().toString(),
      title: req.body.title,
      date: req.body.date,
      desc: req.body.desc,
      photo: req.file ? `/uploads/${req.file.filename}` : '',
      uploader: req.body.uploader,
      timestamp: new Date().toISOString()
    };
    
    memories.push(newMemory);
    writeData('memories.json', memories);
    res.redirect('/');
  } catch (error) {
    console.error('Error saving memory:', error);
    res.status(500).send('保存照片时出错');
  }
});

// 删除照片
app.post('/memories/delete/:id', (req, res) => {
  try {
    const memoryId = req.params.id;
    const memories = readData('memories.json');
    
    // 找到要删除的照片
    const memoryToDelete = memories.find(m => m.id === memoryId);
    
    if (memoryToDelete) {
      // 从数组中移除
      const updatedMemories = memories.filter(m => m.id !== memoryId);
      writeData('memories.json', updatedMemories);
      
      // 删除实际的照片文件
      if (memoryToDelete.photo) {
        const photoPath = path.join(__dirname, 'public', memoryToDelete.photo);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).send('删除照片时出错');
  }
});

// 发布日记
app.post('/diaries', (req, res) => {
  try {
    const diaries = readData('diaries.json');
    const newDiary = {
      id: Date.now().toString(),
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      author: req.body.author,
      timestamp: new Date().toISOString()
    };
    
    diaries.push(newDiary);
    writeData('diaries.json', diaries);
    res.redirect('/');
  } catch (error) {
    console.error('Error saving diary:', error);
    res.status(500).send('保存日记时出错');
  }
});

// 添加待办事项
app.post('/todos', (req, res) => {
  try {
    const todos = readData('todos.json');
    const newTodo = {
      id: Date.now().toString(),
      task: req.body.task,
      deadline: req.body.deadline,
      notes: req.body.notes,
      creator: req.body.creator,
      completed: false,
      timestamp: new Date().toISOString()
    };
    
    todos.push(newTodo);
    writeData('todos.json', todos);
    res.redirect('/');
  } catch (error) {
    console.error('Error saving todo:', error);
    res.status(500).send('保存待办事项时出错');
  }
});

// 发送消息
app.post('/messages', (req, res) => {
  try {
    const messages = readData('messages.json');
    const newMessage = {
      id: Date.now().toString(),
      sender: req.body.sender,
      message: req.body.message,
      timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    writeData('messages.json', messages);
    res.redirect('/');
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).send('发送消息时出错');
  }
});

// 处理点赞功能
app.post('/like', (req, res) => {
  try {
    const { type, id, user } = req.body;
    const likes = readData('likes.json');
    
    // 查找是否已经点赞
    const existingLikeIndex = likes.findIndex(
      like => like.type === type && like.id === id && like.user === user
    );
    
    if (existingLikeIndex > -1) {
      // 取消点赞
      likes.splice(existingLikeIndex, 1);
    } else {
      // 添加点赞
      likes.push({
        id: Date.now().toString(),
        type,
        id,
        user,
        timestamp: new Date().toISOString()
      });
    }
    
    writeData('likes.json', likes);
    res.json({ success: true, likes: likes.filter(like => like.type === type && like.id === id).length });
  } catch (error) {
    console.error('Error handling like:', error);
    res.status(500).json({ success: false, error: '处理点赞时出错' });
  }
});

// 更新待办事项状态
app.post('/toggle-todo', (req, res) => {
  try {
    const { id } = req.body;
    const todos = readData('todos.json');
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex > -1) {
      todos[todoIndex].completed = !todos[todoIndex].completed;
      writeData('todos.json', todos);
      res.json({ success: true, completed: todos[todoIndex].completed });
    } else {
      res.json({ success: false, error: '未找到待办事项' });
    }
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ success: false, error: '更新待办事项时出错' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
    