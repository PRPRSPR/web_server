// npm init
// npm >> express

const express = require('express')
const db = require('./db')
const cors = require('cors')

const app = express()
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World')
})
// 주소 설정 >> '/'
// .get .post .delete
// app.get('/board/list', (req, res)=>{    >> async
app.get('/board/list', async (req, res)=>{
    try{
        // let list = db.query("select * from board"); >> 동기화 필요 await
        let [list] = await db.query("select * from board");
        console.log(list);
        res.json({
            message:"result",
            list : list
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

app.get('/board/view', async (req, res)=>{
    let {BOARDNO} = req.query
    try{
        let [list] = await db.query("select * from board where boardno = "+BOARDNO);
        console.log(list);
        res.json({
            message:"result",
            info : list[0]
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

app.get('/board/remove', async (req, res)=>{
    let {BOARDNO} = req.query
    try{
        let result = await db.query("delete from board where boardno = "+BOARDNO);
        res.json({
            message:"삭제되었습니다."
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

app.listen(3000, ()=>{
    console.log("서버 실행 중");
})
// 3000번 포트 >> localhost:3000

// node server.js >> ctrl+c 서버종료
//  >>> nodemon server.js
// mysql2 설치

