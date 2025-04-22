const express = require('express')
const db = require('./db')
const cors = require('cors')

const app = express()
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/product', async (req, res)=>{
    try{
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;

        const [countResult] = await db.query("SELECT COUNT(*) as total FROM tbl_product");
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        let [list] = await db.query("select * from tbl_product order by productId desc limit ? offset ?",[limit,offset]);
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

app.get('/product/:productId', async (req, res)=>{
    let {productId} = req.params;
    try{
        let [list] = await db.query("select * from tbl_product where productId = "+productId);
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

app.post('/product', async (req, res)=>{
    let {productName, description, price, stock, category} = req.body;
    try{
        let query = "insert into tbl_product values(null,?,?,?,?,?,'Y',now(),now())"
        let result = await db.query(query, [productName, description, price, stock, category]);
        res.json({
            message:"result",
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

app.delete('/product/:productId', async (req, res)=>{
    let {productId} = req.params;
    try{
        let result = await db.query("delete from tbl_product where productId = "+productId);
        res.json({
            message:"result",
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

app.put('/product/:productId', async (req, res)=>{
    let {productId} = req.params;
    let {productName, description, price, stock, category} = req.body;
    try{
        let query = "update tbl_product set productName = ?, description = ?, price = ?, stock = ?, category = ? where productId = "+productId;
        let result = await db.query(query, [productName, description, price, stock, category]);
        res.json({
            message:"result",
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

app.listen(3000, ()=>{
    console.log("서버 실행 중");
})