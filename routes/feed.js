const express = require('express')
const db = require('../db')
const router = express.Router();

router.get('/', async (req, res)=>{
    try{
        let [list] = await db.query("select * from tbl_feed f left join tbl_user u on f.userId=u.userId order by f.id desc");
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

router.get('/:id', async (req, res)=>{
    let {id} = req.params;
    try{
        let [info] = await db.query("select * from tbl_feed where id = "+id);
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

router.delete('/:id', async (req, res)=>{
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

router.put('/:id', async (req, res)=>{
    let {id} = req.params;
    const {userId, content} = req.body;
    try{
        let query = "update tbl_feed set userId = ?, content = ?, cdatetime = now() where id = ?";
        let result = await db.query(query, [userId, content, id]);

        res.json({
            message: "result", 
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.post('/', async (req, res)=>{
    const {userId, content} = req.body;
    try{
        let query = "insert into tbl_feed values(null, ?, ?, now())"
        let result  = await db.query(query, [userId, content]);

        res.json({
            message:"result",
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

module.exports = router;