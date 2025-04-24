const express = require('express')

const boardRouter = require('./routes/board')

const cors = require('cors')

const app = express()
app.use(express.json());
app.use(cors({
    origin : "http://localhost:5502",
    credentials : true
}));

app.use("/board", boardRouter);

app.listen(3000, ()=>{
    console.log("서버 실행 중");
})