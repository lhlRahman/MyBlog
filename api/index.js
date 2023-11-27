const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const { User } = require('./models/User');
const { Post } = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs').promises;
require('dotenv').config();
const path = require('path'); 

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET_KEY;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.basename(file.originalname));
  }
});

const uploadMiddleware = multer({ storage: storage });

// Enable CORS for the specified origin
const allowedOrigins = [
  'https://habibs-blog.vercel.app',
  'http://habibs-blog.vercel.app',
  'https://whoishabib.wiki',
  'http://whoishabib.wiki',
  'http://localhost:3000'  // For development purposes
];

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.static('static'))

// Parse JSON request bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Serve static files from the '/uploads' directory
app.use('/uploads', express.static(__dirname + '/uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware to handle SyntaxError for invalid JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ message: 'Invalid JSON payload' });
  }
  next();
});

// Function to verify JWT token
function verifyToken(token) {
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Register endpoint called');
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login endpoint called');
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({ message: 'Wrong credentials' });
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error generating token' });
        }
        res.cookie('token', token).json({
          id: userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json({ message: 'Wrong credentials' });
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
});

// Profile endpoint
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  const userInfo = verifyToken(token);
  console.log('Profile endpoint called');
  if (!userInfo) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  res.json(userInfo);
});

// Logout endpoint
app.post('/logout', (req, res) => {
  console.log('Logout endpoint called');
  res.cookie('token', '').json('ok');
});

// Create post endpoint
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { token } = req.cookies;
  const userInfo = verifyToken(token);
  if (!userInfo) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  console.log('User info:', userInfo);
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  await fs.rename(path, newPath);

  const { title, summary, content } = req.body;
  const postDoc = await Post.create({
    title,
    summary,
    content,
    cover: newPath,
    author: userInfo.id,
  });
  res.json(postDoc);
});

// Update post endpoint
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { token } = req.cookies;
  const userInfo = verifyToken(token);
  console.log('Update post endpoint called');
  if (!userInfo) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    await fs.rename(path, newPath);
  }

  const { id, title, summary, content } = req.body;
  const postDoc = await Post.findById(id);

  if (!postDoc) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(userInfo.id);
  if (!isAuthor) {
    return res.status(403).json({ message: 'You are not the author' });
  }

  postDoc.title = title;
  postDoc.summary = summary;
  postDoc.content = content;
  postDoc.cover = newPath || postDoc.cover;

  await postDoc.save();
  res.json(postDoc);
});

// Get all posts endpoint
app.get('/post', async (req, res) => {
  console.log('Get all posts endpoint called');
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

// Get single post endpoint
app.get('/post/:id', async (req, res) => {
  const { token } = req.cookies;
  const userInfo = verifyToken(token);
  console.log('Get single post endpoint called');
  if (!userInfo) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  if (!postDoc) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json(postDoc);
});
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'static/index.html'))
})
// Error handling middleware
// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
