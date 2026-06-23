import pool from '../config/db.js';

export const getReports = async (req, res) => {
    const client = await pool.connect();

    try {
        const { type, timeFilter, supplierId } = req.query;
        let data = [];

        // 1. Sales Report
        if (type === 'sales') {
            let dateCondition = "";

            if (timeFilter === 'today') {
                dateCondition = "WHERE DATE(sale_date) = CURRENT_DATE";
            } else if (timeFilter === 'month') {
                dateCondition = "WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)";
            } else if (timeFilter === 'year') {
                dateCondition = "WHERE EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)";
            }

            const query = `
                SELECT 
                    invoice_no, 
                    TO_CHAR(sale_date, 'YYYY-MM-DD HH24:MI') as date,
                    (SELECT COALESCE(SUM(quantity), 0) FROM sale_items WHERE sale_id = sales.id) as items_count,
                    total_amount 
                FROM sales 
                ${dateCondition}
                ORDER BY sale_date DESC
            `;

            const result = await client.query(query);
            data = result.rows;
        }

        // 2. Stock Report
        else if (type === 'stock') {
            const query = `
                SELECT 
                    barcode as code, 
                    name, 
                    stock_quantity as current_stock,
                    CASE 
                        WHEN stock_quantity <= 0 THEN 'Out of Stock' 
                        WHEN stock_quantity < 5 THEN 'Low Stock' 
                        ELSE 'In Stock' 
                    END as status 
                FROM products 
                ORDER BY stock_quantity ASC
            `;

            const result = await client.query(query);
            data = result.rows;
        }

        // 3. Supplier Purchase (GRN) Report
        else if (type === 'supplier') {
            let supplierCondition = "";
            let params = [];

            // Filter by a specific supplier if selected
            if (supplierId && supplierId !== 'all') {
                supplierCondition = "WHERE pur.supplier_id = $1";
                params.push(supplierId);
            }

            const query = `
                SELECT 
                    pur.reference_no as grn_no, 
                    TO_CHAR(pur.purchase_date, 'YYYY-MM-DD HH12:MI AM') as date, 
                    s.name as supplier, 
                    pur.total_amount as total_value,
                    (
                        SELECT STRING_AGG(
                            p.name || ' x' || pi.quantity,
                            ', '
                        )
                        FROM purchase_items pi
                        JOIN products p ON pi.product_id = p.id
                        WHERE pi.purchase_id = pur.id
                    ) as items_received
                FROM purchases pur
                JOIN suppliers s ON pur.supplier_id = s.id
                ${supplierCondition}
                ORDER BY pur.purchase_date DESC
            `;

            const result = await client.query(query, params);
            data = result.rows;
        }

        res.status(200).json(data);

    } catch (err) {
        console.error('Error generating report:', err);

        res.status(500).json({
            error: 'Server error fetching reports',
            details: err.message
        });
    } finally {
        client.release();
    }
};