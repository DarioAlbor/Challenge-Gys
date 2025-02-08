import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { Poliza } from '../models/poliza.model';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { RowDataPacket, OkPacket } from 'mysql2';

interface EstadisticasFecha extends RowDataPacket {
  fecha: string;
  cantidad: number;
  prima_total: number;
}

interface CompaniaStats extends RowDataPacket {
  company: string;
  count: number;
}

interface PrimaStats extends RowDataPacket {
  company: string;
  total: number;
}

interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  type?: string;
  yAxisID?: string;
}

interface TableDataset {
  label: string;
  data: string[][];
}

interface ReportData {
  activeSection: string;
  title: string;
  labels: string[];
  datasets: Dataset[] | TableDataset[];
}

class PolizasController {
  async crearPoliza(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const poliza: Poliza = req.body;
      await pool.execute(
        'INSERT INTO polizas (id_compania, nombre_compania, numero_poliza, fecha_emision, estado, prima, seccion) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [poliza.id_compania, poliza.nombre_compania, poliza.numero_poliza, poliza.fecha_emision, poliza.estado, poliza.prima, poliza.seccion]
      );
      res.status(201).json({ 
        success: true,
        message: 'Póliza creada exitosamente' 
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [porCompania] = await pool.execute<CompaniaStats[]>(
        'SELECT nombre_compania as company, COUNT(*) as count FROM polizas GROUP BY nombre_compania'
      );

      const [activas] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM polizas WHERE estado = 1');
      const [inactivas] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM polizas WHERE estado = 0');
      
      const [primasPorCompania] = await pool.execute<PrimaStats[]>(
        'SELECT nombre_compania as company, SUM(prima) as total FROM polizas GROUP BY nombre_compania'
      );

      const [primaTotal] = await pool.execute<RowDataPacket[]>(
        'SELECT SUM(prima) as total FROM polizas'
      );

      const [distribucionFechas] = await pool.execute<EstadisticasFecha[]>(`
        SELECT 
          DATE_FORMAT(fecha_emision, '%Y-%m') as fecha,
          COUNT(*) as cantidad,
          SUM(prima) as prima_total
        FROM polizas 
        GROUP BY DATE_FORMAT(fecha_emision, '%Y-%m')
        ORDER BY fecha_emision ASC
      `);

      const stats = {
        policiesByCompany: porCompania,
        activeVsInactive: {
          active: (activas[0] as any).count,
          inactive: (inactivas[0] as any).count
        },
        policiesByDate: distribucionFechas.map((item: any) => ({
          date: item.fecha,
          count: item.cantidad,
          premium: item.prima_total
        })),
        premiumStats: {
          byCompany: primasPorCompania,
          total: (primaTotal[0] as any).total
        }
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPolizas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query;
      let query = 'SELECT * FROM polizas WHERE 1=1';
      const params: any[] = [];

      if (filters.compania) {
        query += ' AND nombre_compania = ?';
        params.push(filters.compania);
      }
      if (filters.estado !== undefined) {
        query += ' AND estado = ?';
        params.push(filters.estado);
      }
      if (filters.fechaInicio && filters.fechaFin) {
        query += ' AND fecha_emision BETWEEN ? AND ?';
        params.push(filters.fechaInicio, filters.fechaFin);
      }
      if (filters.seccion) {
        query += ' AND seccion = ?';
        params.push(filters.seccion);
      }

      const [rows] = await pool.execute(query, params);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPolizaPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [rows] = await pool.execute('SELECT * FROM polizas WHERE id = ?', [req.params.id]);
      const poliza = (rows as any[])[0];
      if (!poliza) {
        res.status(404).json({ message: 'Póliza no encontrada' });
        return;
      }
      res.json(poliza);
    } catch (error) {
      next(error);
    }
  }

  async generarReporteExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportData: ReportData = req.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(reportData.title);

      if (reportData.activeSection === 'table') {
        worksheet.addRow([reportData.title.toUpperCase()]);
        worksheet.addRow([`Reporte generado el ${new Date().toLocaleDateString()}`]);
        worksheet.addRow([]);

        worksheet.addRow(reportData.labels);

        const tableData = reportData.datasets[0] as TableDataset;
        tableData.data.forEach(row => {
          worksheet.addRow(row);
        });

        worksheet.getRow(1).font = { bold: true, size: 16 };
        worksheet.getRow(4).font = { bold: true };
        worksheet.columns = worksheet.columns.map(column => ({
          ...column,
          width: 20,
          alignment: { horizontal: 'center' }
        }));
      } else {
        worksheet.addRow([reportData.title.toUpperCase()]);
        worksheet.addRow([`Reporte generado el ${new Date().toLocaleDateString()}`]);
        worksheet.addRow([]);
        worksheet.addRow(['Categoría', ...reportData.labels]);
        (reportData.datasets as Dataset[]).forEach(dataset => {
          worksheet.addRow([dataset.label, ...dataset.data]);
        });
        
        worksheet.getRow(1).font = { bold: true, size: 16 };
        worksheet.getRow(4).font = { bold: true };
        worksheet.columns = worksheet.columns.map(column => ({
          ...column,
          width: 15
        }));
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-${reportData.activeSection}.xlsx`);
      await workbook.xlsx.write(res);
    } catch (error) {
      next(error);
    }
  }

  async generarReportePDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportData: ReportData = req.body;
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-${reportData.activeSection}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).text(reportData.title.toUpperCase(), { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Reporte generado el ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      if (reportData.activeSection === 'table') {
        const tableData = reportData.datasets[0] as TableDataset;
        const startX = 50;
        let startY = doc.y;
        const columnWidth = doc.page.width / (reportData.labels.length + 1);

        doc.font('Helvetica-Bold');
        reportData.labels.forEach((header, i) => {
          doc.text(header, startX + (i * columnWidth), startY, {
            width: columnWidth,
            align: 'center'
          });
        });

        doc.font('Helvetica');
        startY += 30;
        tableData.data.forEach((row, rowIndex) => {
          let maxHeight = 0;
          row.forEach((cell, i) => {
            const cellHeight = doc.heightOfString(cell, { width: columnWidth - 10 });
            maxHeight = Math.max(maxHeight, cellHeight);
          });

          row.forEach((cell, i) => {
            doc.text(cell, 
              startX + (i * columnWidth), 
              startY, 
              { width: columnWidth - 10, align: 'center' }
            );
          });

          startY += maxHeight + 10;
          if (startY > doc.page.height - 100) {
            doc.addPage();
            startY = 50;
          }
        });
      } else {
        const datasets = reportData.datasets as Dataset[];
        const tableData = [
          ['Categoría', ...datasets.map(ds => ds.label)],
          ...reportData.labels.map((label, index) => [
            label,
            ...datasets.map(ds => ds.data[index].toString())
          ])
        ];

        let yPosition = doc.y;
        const cellWidth = 150;

        tableData.forEach((row, rowIndex) => {
          let xPosition = 50;
          row.forEach((cell: string, cellIndex: number) => {
            if (rowIndex === 0) doc.font('Helvetica-Bold');
            else doc.font('Helvetica');
            
            doc.text(cell, xPosition, yPosition, {
              width: cellWidth,
              align: 'left'
            });
            xPosition += cellWidth;
          });
          yPosition += 20;
        });
      }

      doc.end();
    } catch (error) {
      next(error);
    }
  }

  async borrarPoliza(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const [result]: any = await pool.execute(
        'DELETE FROM polizas WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Póliza no encontrada' });
        return;
      }

      res.json({ message: 'Póliza eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new PolizasController();