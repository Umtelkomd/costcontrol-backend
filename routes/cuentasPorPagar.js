const express = require('express');
const router = express.Router();
const cuentasPorPagarController = require('../controllers/cuentasPorPagarController');

router.get('/', cuentasPorPagarController.getAll);
router.get('/:id', cuentasPorPagarController.getById);
router.post('/', cuentasPorPagarController.create);
router.put('/:id', cuentasPorPagarController.update);
router.delete('/:id', cuentasPorPagarController.remove);

module.exports = router; 