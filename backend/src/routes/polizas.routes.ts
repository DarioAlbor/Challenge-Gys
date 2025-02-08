import { Router } from 'express';
import PolizasController from '../controllers/polizas.controller';

const router = Router();

router.post('/', PolizasController.crearPoliza);
router.get('/estadisticas', PolizasController.obtenerEstadisticas);
router.get('/', PolizasController.obtenerPolizas);
router.get('/:id', PolizasController.obtenerPolizaPorId);
router.delete('/:id', PolizasController.borrarPoliza);
router.post('/reportes/excel', PolizasController.generarReporteExcel);
router.post('/reportes/pdf', PolizasController.generarReportePDF);

export default router;