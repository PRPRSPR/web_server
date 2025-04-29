const express = require('express')
const db = require('../db')
const authMiddleware  = require('../auth')
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

const upload = multer({ storage: storage });

// router.get('/product', async (req, res)=>{
router.get('/', async (req, res)=>{
    try{
        
        let [list] = await db.query("select * from tbl_product order by productId desc ");
        console.log(list);
        res.json({
            message:"result",
            list : list,
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.get('/:productId', async (req, res)=>{
    let {productId} = req.params;
    try{
        let [list] = await db.query("select p.*, f.filePath from tbl_product p left join tbl_product_file f on p.productId = f.productId where p.productId = "+productId);
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

router.post('/', upload.single('productImage'), async (req, res)=>{
    const productInfo = JSON.parse(req.body.productInfo);
    const file = req.file;
    const {productName, description, price, stock, category} = productInfo;
    try{
        let productQuery = "insert into tbl_product values(null,?,?,?,?,?,'Y',now(),now())"
        let productResult  = await db.query(productQuery, [productName, description, price, stock, category]);
        const productId = productResult.insertId;

        if (file) {
            const fileQuery = `
                INSERT INTO tbl_product_file (productId, fileName, filePath) 
                VALUES (?, ?, ?)
            `;
            await db.query(fileQuery, [
                productId,
                file.filename,
                `/uploads/${file.filename}`
            ]);
        }
        res.json({
            message:"제품 등록 및 이미지 저장 성공",
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

router.delete('/:productId', authMiddleware, async (req, res)=>{
    // 삭제 실행 전 토큰으로 유저 확인 먼저 함(authMiddleware)
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

router.put('/:productId', upload.single('productImage'), async (req, res)=>{
    const {productId} = req.params;
    const productInfo = JSON.parse(req.body.productInfo);
    const file = req.file;
    const {productName, description, price, stock, category} = productInfo;
    try{
        let updateQuery = "update tbl_product set productName = ?, description = ?, price = ?, stock = ?, category = ? where productId = ?";
        let updateResult = await db.query(updateQuery, [productName, description, price, stock, category, productId]);

        if (file) {
            const [oldFiles] = await db.query(`SELECT * FROM tbl_product_file WHERE productId = ?`, [productId]);
            if (oldFiles.length > 0) {
                await db.query(`DELETE FROM tbl_product_file WHERE productId = ?`, [productId]);
            }

            await db.query(`
                INSERT INTO tbl_product_file (productId, fileName, filePath)
                VALUES (?, ?, ?)
            `, [
                productId,
                file.filename,
                `/uploads/${file.filename}`
            ]);
        }
        res.json({
            message: "제품 수정 완료", 
            image: file ? `/uploads/${file.filename}` : null
        });
    } catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error");
    }
})

module.exports = router;