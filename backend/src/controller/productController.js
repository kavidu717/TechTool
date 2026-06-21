import pool from "../config/db.js";


export const addProduct=async(req,res)=>{
    try{
        const {name,category,brand,description,barcode,selling_price,min_selling_price,stock_quantity}=req.body;

        const newProduct=await pool.query(
            "INSERT INTO products(name,category,brand,description,barcode,selling_price,min_selling_price,stock_quantity) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
            [name,category,brand,description,barcode,selling_price,min_selling_price,stock_quantity]
        );

        res.status(201).json({
            message:"product added successfully",
            product:newProduct.rows[0],
        });

        

    }catch(err){
     console.error(err.message);
     res.status(500).json({ error: "Server error" });
    }
}

export const getProducts=async(req,res)=>{
    try{

        const allProducts=await pool.query("SELECT * FROM products ORDER BY id DESC");
        res.json(allProducts.rows);


    }catch(err){
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

