const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const { UserModel } = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { info } = require('console');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = bcrypt.genSaltSync(10);

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect(`mongodb+srv://lhlrahman:15D8Ca0e2FaUi3Qa@cluster0.jgpiirq.mongodb.net/`);

app.post('/register', async (req, res) => {
  const {username, password} = req.body;
  try {
    const userDoc = await UserModel.create({
      username, 
      password: bcrypt.hashSync(password, salt)
    });
    res.json(userDoc);
    return;
  } catch (error) {
    res.status(400).json({error: "Failed to register"});
  }
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await UserModel.findOne({username});
  
  if (!userDoc) {
    return res.status(400).json('wrong credentials');
  }
  
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    console.log('logged in');
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', async (req, res) => {
  const {token} = req.cookies;
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, secret, (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.json(info);
  });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token').json({ message: "Logged out" });
});

app.post('/post', uploadMiddleware.single('files'), async (req, res) => {
  const {originalname, path} = req.file;
 
  // parts is an array that has two sections. one after the dot (.) and the other after the dot (.) therefore the extension of the file.
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);
  
  // grabes user credentials
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const {title, summary, content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author:info.id,
    });
  res.json(postDoc);
  });


});

app.get('/post', async (req, res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});