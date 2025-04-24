const express = require('express')
const db = require('../db');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_KEY = "12345678912345678912345678912345";

router.post('/', async (req, res)=>{
    let {userId, pwd} = req.body;
    try{
        let [user] = await db.query("select userId, pwd, userName, phone, status from tbl_user where userId = ?", [userId]);
        if(user.length > 0){
            let isMatch = await bcrypt.compare(pwd, user[0].pwd);
            if(isMatch){
                const token = jwt.sign({
                    userId : user[0].userId,
                    userName : user[0].userName,
                    userPhone : user[0].phone,
                    userStatus : user[0].status,
                },
                JWT_KEY, {expiresIn : '1h'});
                res.json({ 
                    success: true, 
                    message : "로그인 성공!", 
                    token 
                });
            } else {
                res.json({ 
                    success: false, 
                    message: '비밀번호!' 
                });

            }
        } else {
            res.json({ 
                success: false, 
                message: '실패!' 
            });
        }
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

module.exports = router;