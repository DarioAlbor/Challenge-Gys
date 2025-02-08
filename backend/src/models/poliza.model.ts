import pool from '../config/db';

export interface Poliza {
  id?: number;
  id_compania: number;
  nombre_compania: string;
  numero_poliza: number;
  fecha_emision: string;
  estado: number;
  prima: number;
  seccion: string;
}

export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
      await connection.query(`USE ${process.env.DB_NAME}`);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS polizas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          id_compania INT NOT NULL,
          nombre_compania VARCHAR(100) NOT NULL,
          numero_poliza INT NOT NULL,
          fecha_emision DATE NOT NULL,
          estado TINYINT NOT NULL DEFAULT 1,
          prima INT NOT NULL,
          seccion VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT chk_compania CHECK (nombre_compania IN ('Compañía1', 'Compañía2', 'Compañía3', 'Compañía4', 'Compañía5')),
          CONSTRAINT chk_seccion CHECK (seccion IN ('automotor', 'robo', 'responsabilidad civil', 'combinado familiar', 'integral para comercio')),
          CONSTRAINT chk_estado CHECK (estado IN (0, 1))
        )
      `);
      console.log('Base de datos iniciada');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error iniciando la base de datos:', error);
    throw error;
  }
}