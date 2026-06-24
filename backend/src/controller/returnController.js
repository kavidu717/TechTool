import pool from "../config/db.js";


export const getReturns=async(req,res)=>{


    try{

        const {invoiceNo}=req.params;

        const saleQuery=await pool.query("SELECT id,invoice_no,cashier_id,total_amount,discount,sale_date FROM sales WHERE invoice_no=$1",[invoiceNo]);


        if(saleQuery.rows.length===0){
            return res.status(404).json({error:"invoice not found"});

        }

        const saleData=saleQuery.rows[0];


        const itemsQuery = await pool.query(
            `SELECT 
                si.id AS sale_item_id,
                si.product_id,
                p.name AS product_name,
                si.quantity,
                si.selling_price
             FROM sale_items si
             JOIN products p ON si.product_id = p.id
             WHERE si.sale_id = $1`,
            [saleData.id]
        );

        const responseData = {
            sale: {
                id: saleData.id,
                invoiceNo: saleData.invoice_no,
                cashierId: saleData.cashier_id,
                totalAmount: saleData.total_amount,
                discount: saleData.discount,
                saleDate: saleData.sale_date
            },
            items: itemsQuery.rows
        };

        res.json({ success: true, data: responseData });


    }catch(err){
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}