const express = require('express')
const db = require('../db')
const router = express.Router();

router.get('/', async (req, res)=>{
    try{
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;

        const [countResult] = await db.query("SELECT COUNT(*) as total FROM student");
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        let [list] = await db.query("select * from student order by stu_no asc limit ? offset ?",[limit,offset]);
        console.log(list);
        res.json({
            message:"result",
            list : list,
            total: total,
            totalPages: totalPages,
            currentPage: page
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.get('/:stuNo', async (req, res)=>{
    let {stuNo} = req.params;
    console.log(stuNo);
    try{
        let [list] = await db.query("select * from student where stu_no = "+stuNo);
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

module.exports = router;