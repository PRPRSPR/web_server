const express = require('express')

const productRouter = require('./routes/product')
const userRouter = require('./routes/user')
const loginRouter = require('./routes/login')
const studentRouter = require('./routes/student')
const feedRouter = require('./routes/sns/feed')
const feed2Router = require('./routes/feed2')
const memberRouter = require('./routes/sns/member')

const path = require('path')
const cors = require('cors')
const session = require('express-session')

const app = express()
app.use(express.json({ limit: '30mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors({
    // 보안정책 관련
    origin : ["http://localhost:3000","http://localhost:3001"],
    // 허용 url
    credentials : true
    // 쿠키 허용
}));
app.use(session({
    secret: 'test1234',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly : true,
        secure : false,
        maxAge : 1000 * 60 * 30
    }
  }))

// app.use("/", productRouter);
app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/login", loginRouter);
app.use("/student", studentRouter);
app.use("/feed", feedRouter);
app.use("/feed2", feed2Router);
app.use("/member", memberRouter);

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(3005, ()=>{
    console.log("서버 실행 중");
})