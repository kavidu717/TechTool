import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './src/config/db.js';

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




app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});