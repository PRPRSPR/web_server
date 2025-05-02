// sns sample >> tbl_feed 

const express = require('express')
const db = require('../../db')
const authMiddleware  = require('../../auth')
const multer  = require('multer')
const path = require('path');
const router = express.Router();

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

router.get('/', async (req, res)=>{
    let {email} = req.query;
    try{
        let sql = "select f.*, m.userName, i.imgPath from tbl_feed f left join tbl_member m on f.email = m.email left join tbl_feed_img i on f.id = i.feedId where i.thumbnailYn = 'Y' ";
        if(email){
            sql += " and f.email = '"+email+"' ";
        }
        let [list] = await db.query(sql + " order by f.id desc");
        console.log(list);
        res.json({
            message:"result",
            list : list
        });
    } catch(err){
        console.log(err.message);
        res.status(500).send("Server Error");
    }
})

router.get('/:id', async (req, res)=>{
    let {id} = req.params;
    try{
        let [info] = await db.query("select f.*, m.userName from tbl_feed f left join tbl_member m on f.email = u.email where id = "+id);
        let [imgInfo] = await db.query("select * from tbl_feed_img where feedId = "+id);
        console.log(info);
        res.json({
            message:"result",
            info : info[0],
            imgList : imgInfo
        });
    } catch(err){
        console.log(err.message);
        res.status(500).send("Server Error");
    }
})

router.delete('/:id', authMiddleware, async (req, res)=>{
    let {id} = req.params;
    try{
        let result = await db.query("delete from tbl_feed where id = "+id);
        res.json({
            message:"result",
            result:result
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.put('/:id', upload.array('feedImages',10), async (req, res)=>{
    let {id} = req.params;
    const feedInfo = JSON.parse(req.body.feedInfo);
    const {title, content, thumbnailYn, imgNo} = feedInfo;
    const files = req.files;
    console.log(files);
    try{
        let feedQuery = "update tbl_feed set title = ?, content = ?, udatetime = now() where id = ?";
        let feedResult = await db.query(feedQuery, [title, content, id]);
        
        for (let file of files) {
            console.log(file.originalname);
            await db.query(
                "update tbl_feed_img set imgName = ?, imgPath = ?, thumbnailYn =? where imgNo = ?", 
                [file.originalname, `/uploads/${file.filename}`, thumbnailYn, imgNo]
            );
        }

        res.json({
            message:"피드 수정 완료",
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.post('/', upload.array('feedImage',10), async (req, res)=>{
    const feedInfo = JSON.parse(req.body.feedInfo);
    const {email, title, content} = feedInfo;
    const files = req.files;
    console.log(files);
    try{
        let feedQuery = "insert into tbl_feed values(null, ?, ?, ?, now(), now())"
        let feedResult  = await db.query(feedQuery, [email, title, content]);
        const id = feedResult[0].insertId;
        
        if (files && files.length > 0) {
            const fileQuery = "insert into tbl_feed_img values ?";
            const values = files.map((file,index) => [null, id, file.originalname, `/uploads/${file.filename}`, index === 0 ? 'Y' : 'N']);
            await db.query(fileQuery, [values]);
        }
        
        res.json({
            message:"피드 등록 완료",
        });
    } catch(err){
        console.log(err.message);
        res.status(500).send("Server Error");
    }
})

module.exports = router;