import pool from "../config/db.js";


export const getReports=async(req,res)=>{

    const client=await pool.connect();
    try{
         

        // frontend parameters
        const {type,timeFilter,supplierId}=req.query;
      let data=[]

        if(type==="sales"){

            if(timeFilter==="today"){
                dataCondition=`WHERE DATE(sale_date)=CURRENT_DATE`
            }else if(timeFilter==="month"){
                dataCondition=`WHERE EXTRACT(MONTH FROM sale_date)=EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM sale_date)=EXTRACT(YEAR FROM CURRENT_DATE)`
              
            }else if(timeFilter==="year"){
                dataCondition=`WHERE EXTRACT(YEAR FROM sale_date)=EXTRACT(YEAR FROM CURRENT_DATE)`

            }

            const query = `
                SELECT 
                    invoice_no, 
                    TO_CHAR(sale_date, 'YYYY-MM-DD HH24:MI') as date,
                    (SELECT SUM(quantity) FROM sale_items WHERE sale_id = sales.id) as items_count,
                    total_amount 
                FROM sales 
                ${dateCondition}
                ORDER BY sale_date DESC
            `;
            const result = await client.query(query);
            data = result.rows;
        } else if (type === 'stock') {
            const query = `
                SELECT 
                    barcode as code, 
                    name, 
                    stock_quantity as current_stock,
                    CASE 
                        WHEN stock_quantity = 0 THEN 'Out of Stock' 
                        WHEN stock_quantity < 5 THEN 'Low Stock' 
                        ELSE 'In Stock' 
                    END as status 
                FROM products 
                ORDER BY stock_quantity ASC
            `;
            const result = await client.query(query);
            data = result.rows;
        }else if (type === 'supplier') {
            let supplierCondition = "";
            let params = [];
            
            if (supplierId && supplierId !== 'all') {
                supplierCondition = "WHERE g.supplier_id = $1";
                params.push(supplierId);
            }
            
            const query = `
                SELECT 
                    g.grn_no, 
                    TO_CHAR(g.grn_date, 'YYYY-MM-DD') as date, 
                    s.name as supplier, 
                    g.total_amount as total_value,
                    (SELECT STRING_AGG(p.name || ' x' || gi.quantity, ', ') 
                     FROM grn_items gi 
                     JOIN products p ON gi.product_id = p.id 
                     WHERE gi.grn_id = g.id) as items_received
                FROM grn g
                JOIN suppliers s ON g.supplier_id = s.id
                ${supplierCondition}
                ORDER BY g.grn_date DESC
            `;
            const result = await client.query(query, params);
            data = result.rows;
        }

        res.status(200).json(data);



    }catch(err){
        console.error("error generaring report",err);
        res.status(500).json({ error: "Server error" });
    }finally{
        client.release();
    }
}





