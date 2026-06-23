import pool from "../config/db.js";

export const  addPurchase=async(req,res)=>{

    // for the transaction
    const client = await pool.connect();
    try{
        const {supplier_id,reference_no,total_amount,items}=req.body;

        // start the transaction
        await client.query("BEGIN");
         
        // insert the items
        const purchaseRes=await client.query("INSERT INTO purchases(supplier_id,reference_no,total_amount,purchase_date)VALUES($1,$2,$3,NOW()) RETURNING *",[supplier_id,reference_no,total_amount]); 

        const purchase_id=purchaseRes.rows[0].id;

        for(let item of items){
             
            // add the item for the purchase item table
            await client.query("INSERT INTO purchase_items(purchase_id,product_id,quantity,buying_price)VALUES($1,$2,$3,$4)",[purchase_id,item.product_id,item.quantity,item.buying_price]);

            // update the stock quantity
            await client.query("UPDATE products SET stock_quantity=stock_quantity+$1 WHERE id=$2",[item.quantity,item.product_id]);


        }

        // commit the transaction
        await client.query("COMMIT");
          

        res.status(201).
        json({
            message:"purchase added successfully"
        });

    }catch(err){

        // not save while error occur
        await client.query("ROLLBACK")
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }finally{
        await client.release();
    }


}

 export const getPurchases=async(req,res)=>{

    try{
       const query = `
            SELECT p.*, s.name as supplier_name 
            FROM purchases p 
            LEFT JOIN suppliers s ON p.supplier_id = s.id 
            ORDER BY p.id DESC
        `;
        
        const allPurchases = await pool.query(query);

        res.json(allPurchases.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).
        json({ 
            error: "Server error" 
        });
    }
 }