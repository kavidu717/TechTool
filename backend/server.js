import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './src/config/db.js';
import userRoutes from './src/routes/userRoutes.js';
import supplierRoutes from './src/routes/supplierRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import purchaseRoutes from './src/routes/purchaseRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import saleRoutes from './src/routes/salesRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import returnRoutes from './src/routes/returnRoutes.js';

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

 
app.get('/api/test', async(req, res) => {
    try{
        const result= await pool.query("SELECT NOW()")
        res.json(
            {
                message: "backend and database are fully connected",
                database_time: result.rows[0].now
            }
        );

    }catch(error){
        console.log(error);
        res.status(500).
        json({error: error.message});
    }
});



app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/returns', returnRoutes);



app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});