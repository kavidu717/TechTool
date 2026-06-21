import pool from "../config/db.js";

export const addSale=async(req,res)=>{
      
    // for the transaction
    const client=await pool.connect();
    try{
        
        const {invoice_no,total_amount,discount,items}=req.body;
          
        // get the logged cashier id
        const cashier_id=req.user.id;

        // start the transaction
        await client.query("BEGIN");

        // insert the items
        const saleRes=await client.query("INSERT INTO sales(invoice_no,cashier_id,total_amount,discount,sale_date)VALUES($1,$2,$3,$4,NOW()) RETURNING *",[invoice_no,cashier_id,total_amount,discount]

        );

        const sale_id=saleRes.rows[0].id;

            for(let item of items){

                // add the item for the sale item table
                await client.query("INSERT INTO sale_items(sale_id,product_id,quantity,selling_price)VALUES($1,$2,$3,$4)",[sale_id,item.product_id,item.quantity,item.selling_price]);

                // update the stock quantity
                await client.query("UPDATE products SET stock_quantity=stock_quantity-$1 WHERE id=$2",[item.quantity,item.product_id]);
            }


        // commit the transaction
        await client.query("COMMIT");

        res.status(201).json({
            message:"sale added successfully"
            
        });



         
        


    }catch(err){

        await client.query("ROLLBACK");
        console.error(err.message);
        res.status(500).
        json({
             error: "Server error" 
            });
    }finally{
        client.release();
    }

}

export const getSales=async(req,res)=>{

    try{
        const allSales=await pool.query("SELECT * FROM sales ORDER BY id DESC");

        res.json(allSales.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).
        json({
             error: "Server error" 
            });
    }
    
}
