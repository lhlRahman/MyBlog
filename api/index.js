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
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs').promises; // Use promises version of fs for better error handling
require('dotenv').config();

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET_KEY;

app.use(cors({credentials: true, origin: 'https://habibs-blog.vercel.app/'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// MongoDB connection with improved error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if unable to connect to MongoDB
  });

// Middleware for handling invalid JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ message: 'Invalid JSON payload' });
  }
  next();
});

// Register endpoint with error handling
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
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

// Login endpoint with error handling
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
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

// Profile endpoint with error handling
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ message: 'Invalid token' });
    }
    res.json(info);
  });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

// Post creation endpoint with error handling
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    await fs.rename(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: 'Invalid token' });
      }
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
});

// Post update endpoint with error handling
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path + '.' + ext;
      await fs.rename(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: 'Invalid token' });
      }
      const { id, title, summary, content } = req.body;
      const postDoc = await Post.findById(id);

      if (!postDoc) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
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
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
});

// Fetch posts endpoint with error handling
app.get('/post', async (req, res) => {
  try {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        .sort({ createdAt: -1 })
        .limit(20)
    );
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
});

// Fetch a single post endpoint with error handling
app.get('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(postDoc);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

