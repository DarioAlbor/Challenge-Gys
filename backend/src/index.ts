import express from "express";
import { Express } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/routes';
import { initializeDatabase } from './models/poliza.model';

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3001;
app.use(express.json());

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// RUTAS
app.use(router);

// START
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Backend en puerto: ${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar sv:', error);
    process.exit(1);
  }
}

startServer();