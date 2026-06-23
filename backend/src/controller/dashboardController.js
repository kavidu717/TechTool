import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
    try {
        const [
            salesResult,
            todaySalesResult,
            purchasesResult,
            productsResult,
            suppliersResult,
            lowStockResult
        ] = await Promise.all([
            pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales"),
            pool.query("SELECT COALESCE(SUM(total_amount), 0) AS today_sales FROM sales WHERE DATE(sale_date) = CURRENT_DATE"),
            pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_purchases FROM purchases"),
            pool.query("SELECT COUNT(*) AS total_products FROM products"),
            pool.query("SELECT COUNT(*) AS total_suppliers FROM suppliers"),
            pool.query("SELECT id, name, stock_quantity FROM products WHERE stock_quantity <= 5 ORDER BY stock_quantity ASC LIMIT 5")
        ]);

        const dashboardData = {
            totalSales: salesResult.rows[0].total_sales,
            todaySales: todaySalesResult.rows[0].today_sales,
            totalPurchases: purchasesResult.rows[0].total_purchases,
            totalProducts: productsResult.rows[0].total_products,
            totalSuppliers: suppliersResult.rows[0].total_suppliers,
            lowStockProducts: lowStockResult.rows
        };

        res.json(dashboardData);
    } catch (err) {
        console.error("Error in getDashboardStats:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};