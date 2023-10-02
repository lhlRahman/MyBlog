const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const { UserModel } = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { info } = require('console');

const salt = bcrypt.genSaltSync(10);
const secret = bcrypt.genSaltSync(10);

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());

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


app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});