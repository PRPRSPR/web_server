const express = require('express')
const db = require('../db')
const router = express.Router();

router.get('/', async (req, res)=>{
    try{
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let best = req.query.best;
        let offset = (page - 1) * limit;
        
        let  query = "select b.boardNo, b.title, u.userName, b.cnt, date_format(b.cdatetime, '%Y-%m-%d %H:%i') as cdatetime, b.udatetime from tbl_board b inner join tbl_user u on b.userId = u.userId ";
        let  countQuery = "select count(*) as total from tbl_board b inner join tbl_user u on b.userId = u.userId ";
        if(best == "true"){
            query = query+"where b.cnt >= 20 ";
            countQuery = countQuery+"where b.cnt >= 20 ";
        }
        const [countResult] = await db.query(countQuery);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        let [list] = await db.query(query+"order by b.boardNo desc limit ? offset ? ",[limit,offset]);
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

router.get('/:boardNo', async (req, res)=>{
    let {boardNo} = req.params;
    console.log(boardNo);
    try{
        let query = "update tbl_board set cnt = cnt+1 where boardNo = "+boardNo;
        let result = await db.query(query);
        let [list] = await db.query("select b.boardNo, b.title, b.contents, u.userName, b.cnt, date_format(b.cdatetime, '%Y-%m-%d %H:%i') as cdatetime, b.udatetime from tbl_board b inner join tbl_user u on b.userId = u.userId where b.boardNo = "+boardNo);
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

router.delete('/:boardNo', async (req, res)=>{
    let {boardNo} = req.params;
    try{
        let result = await db.query("delete from tbl_board where boardNo = "+boardNo);
        res.json({
            message:"result",
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.put('/:boardNo', async (req, res)=>{
    let {boardNo} = req.params;
    const {title, contents} = req.body;
    try{
        let query = "update tbl_board set title = ?, contents = ?, udatetime = now() where boardNo = ?";
        let result = await db.query(query, [title, contents, boardNo]);

        res.json({
            message: "result", 
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.post('/', async (req, res)=>{
    const {title, contents} = req.body;
    try{
        let query = "insert into tbl_board values(null, ?, ?, 'user001', 0, now(), now())"
        let result  = await db.query(query, [title, contents]);

        res.json({
            message:"result",
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

module.exports = router;