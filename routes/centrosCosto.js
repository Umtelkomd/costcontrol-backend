const express = require('express');
const router = express.Router();
const centrosCostoController = require('../controllers/centrosCostoController');

router.get('/', centrosCostoController.getAll);
router.get('/:id', centrosCostoController.getById);
router.post('/', centrosCostoController.create);
router.put('/:id', centrosCostoController.update);
router.delete('/:id', centrosCostoController.remove);

module.exports = router; 