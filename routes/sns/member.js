const express = require('express')
const db = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer  = require('multer')
const path = require('path');
const router = express.Router();

const JWT_KEY = "12345678912345678912345678912345";

router.use('../uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/', async (req, res)=>{
    let {email, pwd} = req.body;
    try{
        let [user] = await db.query("select email, pwd, userName from tbl_member where email = ?", [email]);
        if(user.length > 0){
            let isMatch = await bcrypt.compare(pwd, user[0].pwd);
            if(isMatch){
                const token = jwt.sign({
                    userEmail : user[0].email,
                    userName : user[0].userName,
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

router.get('/:email', async (req, res)=>{
    let {email} = req.params;
    try{
        let [info] = await db.query("select email, userName, addr, phone, birth, intro, profileImg from tbl_member where email = '"+email+"'");
        console.log(info);
        res.json({
            message:"result",
            info : info[0]
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.put('/', upload.single('profileImage'), async (req, res)=>{
    const {email} = req.body;
    const file = req.file;
    console.log(file);
    try{
        let query = "update tbl_member set profileImg = ?, udatetime = now() where email = ?";
        let result = await db.query(query, [`/uploads/${file.filename}`, email]);

        res.json({
            message:"피드 등록 완료",
            result:result
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.post('/join', async (req, res)=>{
    let {email, pwd, userName, addr, phone, birth, intro} = req.body;
    try{
        let hashPwd = await bcrypt.hash(pwd, 10);

        let query = "insert into tbl_member values (?,?,?,?,?,?,?,null,now(),now()) ";
        let result = await db.query(query, [email, hashPwd, userName, addr, phone, birth, intro]);
        
        res.json({
            message:"result",
            result:result
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

module.exports = router;