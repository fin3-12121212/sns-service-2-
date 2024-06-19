var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs'); // 파일 시스템 모듈 추가
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
require('dotenv').config(); // dotenv 로드

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts'); // posts 라우트 추가
const boardsRouter = require('./routes/boards'); // boards 라우트 추가

var app = express();

// 업로드 폴더가 존재하는지 확인하고, 없으면 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

// MongoDB 연결 설정
mongoose.connect('mongodb+srv://bob:makeit123@fine.mngnqv4.mongodb.net/post?retryWrites=true&w=majority', {
  connectTimeoutMS: 30000, // 30초로 타임아웃 설정
  socketTimeoutMS: 45000, // 45초로 소켓 타임아웃 설정
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir)); // 업로드된 파일 제공을 위한 정적 파일 서비스 설정

app.use(async (req, res, next) => {
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.error('Token expired:', err);
        return res.status(401).json({ message: 'Token expired' });
      } else {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter); // posts 라우트 사용
app.use('/boards', boardsRouter); // boards 라우트 사용

// 루트 경로로 요청이 들어오면 /users로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/users.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
