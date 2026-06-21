import pool from "../config/db.js";

export const getDashboardStats=async(req,res)=>{

    try{

        // execute the queries
        const [salesResuits,purchasesResults,productsResults,suppliersResults,lowStockResults]=await Promise.all([


             pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales"),

        pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_purchases FROM purchases"),

        pool.query("SELECT COUNT(*) AS total_products FROM products"),

        pool.query("SELECT COUNT(*) AS total_suppliers FROM suppliers"),

        pool.query("SELECT id, name, stock_quantity FROM products WHERE stock_quantity <= 5 ORDER BY stock_quantity ASC LIMIT 5")

            
        ])

        const dashboardDate={
            totalSales:salesResuits.rows[0].total_sales,
            totalPurchases:purchasesResults.rows[0].total_purchases,
            totalProducts:productsResults.rows[0].total_products,
            totalSuppliers:suppliersResults.rows[0].total_suppliers,
            lowStockProducts:lowStockResults.rows
        }

        res.json(dashboardDate);

       

    }catch(err){
        console.error("Error in getDashboardStats:", err.message);
        res.status(500).json({ error: "Server error" });
    }
    
}