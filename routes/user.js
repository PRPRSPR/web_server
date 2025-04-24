const express = require('express')
const db = require('../db');
const session = require('express-session');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/', async (req, res)=>{
    let {userId, pwd} = req.body;
    try{
        let [user] = await db.query("select userId, pwd, userName, phone, status from tbl_user where userId = ?", [userId]);

        result = {};
        if(user.length > 0){
            let isMatch = await bcrypt.compare(pwd, user[0].pwd);
            if(isMatch){
                // 세션 값 저장
                req.session.user = {
                    sessionId : user[0].userId,
                    sessionName : user[0].userName,
                    sessionPhone : user[0].phone,
                    sessionStatus : user[0].status,
                }

                // console.log(req.session);
                //  ↓↓↓↓↓
                // Session {
                //     cookie: {
                //       path: '/',
                //       _expires: 2025-04-23T03:18:09.936Z,
                //       originalMaxAge: 1800000,
                //       httpOnly: true,
                //       secure: true
                //     },
                //     user: {
                //       sessionId: 'user001',
                //       sessionName: '홍길동',
                //       sessionPhone: '010-1111-2222'
                //     }
                // }

                result = {
                    message: "로그인 성공",
                    user : req.session.user
                }
            }else {
                result = {
                    message:"비밀번호 확인"
                }
            }            
        } else {
            result = {
                message:"아이디 확인"
            }
        }
        res.json(result);
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.get("/info",(req,res) => {
    if(req.session.user){
        res.json({
            isLogin : true,
            user : req.session.user
        })
    } else {
        res.json({
            isLogin : false
        })
    }
})

router.get("/logout",(req,res) => {
    req.session.destroy(err => {
        if(err){
            console.log("세션 삭제 안됨");
            res.status(500).send("로그아웃 실패");
        } else {
            res.clearCookie("connect.sid");
            res.json({message : "로그아웃 되었습니다."});
        }
    });
})

router.post('/join', async (req, res)=>{
    let {userId, pwd, name, addr, phone} = req.body;
    try{
        let hashPwd = await bcrypt.hash(pwd, 10);
        console.log(hashPwd);

        let query = "insert into tbl_user values (?,?,?,?,?,now(),now(),'C') " 
        console.log(query);
        let [user] = await db.query(query, [userId, hashPwd, name, addr, phone]);
    
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

module.exports = router;