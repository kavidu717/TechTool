import pool from "../config/db.js";

 export const addSupplier =async(req,res)=>{
    try{

        const {name,contact_number,address}=req.body;

        const newSupplier=await pool.query("INSERT INTO suppliers(name,contact_number,address) VALUES($1,$2,$3) RETURNING *",[name,contact_number,address]);

        res.status(201).json({
            message:"supplier added successfully",
            supplier:newSupplier.rows[0],
        });



    }catch(error){
           console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

 export const getSuppliers=async(req,res)=>{
    try{
        const suppliers=await pool.query("SELECT * FROM suppliers ORDER BY id DESC");
        res.json(allSuppliers.rows);

    }catch(error){
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
 }