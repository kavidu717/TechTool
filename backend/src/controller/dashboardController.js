import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
    try {
        // Get the requested date from query parameters, default to today
        const targetDate = req.query.date || new Date().toISOString().split('T')[0];

        const [
            selectedDateSalesResult,
            productsResult,
            suppliersResult,
            lowStockResult,
            last7DaysSalesResult
        ] = await Promise.all([
            // Sales for the selected date
            pool.query("SELECT COALESCE(SUM(total_amount), 0) AS selected_date_sales FROM sales WHERE DATE(sale_date) = $1", [targetDate]),
            
            // Total products in the system
            pool.query("SELECT COUNT(*) AS total_products FROM products"),
            
            // Total suppliers in the system
            pool.query("SELECT COUNT(*) AS total_suppliers FROM suppliers"),
            
            // Items with stock quantity 5 or less
            pool.query("SELECT id, name, stock_quantity FROM products WHERE stock_quantity <= 5 ORDER BY stock_quantity ASC LIMIT 5"),
            
            // Daily sales amounts for the last 7 days
            pool.query(`
                SELECT DATE(sale_date) as date, COALESCE(SUM(total_amount), 0) as amount 
                FROM sales 
                WHERE sale_date >= CURRENT_DATE - INTERVAL '7 days' 
                GROUP BY DATE(sale_date) 
                ORDER BY DATE(sale_date) ASC
            `)
        ]);

        // Aggregate results into a single object to send to the frontend
        const dashboardData = {
            selectedDate: targetDate,
            selectedDateSales: selectedDateSalesResult.rows[0].selected_date_sales,
            totalProducts: productsResult.rows[0].total_products,
            totalSuppliers: suppliersResult.rows[0].total_suppliers,
            lowStockProducts: lowStockResult.rows,
            last7DaysSales: last7DaysSalesResult.rows 
        };

        res.json(dashboardData);
    } catch (err) {
        console.error("Error in getDashboardStats:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};