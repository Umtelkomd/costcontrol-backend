const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');

router.get('/', pagosController.getAll);
router.get('/pending', pagosController.getPending);
router.get('/approved', pagosController.getApproved);
router.get('/:id', pagosController.getById);
router.post('/', pagosController.create);
router.put('/:id', pagosController.update);
router.delete('/:id', pagosController.remove);

// Approval routes
router.post('/:id/approve', pagosController.approve);
router.post('/:id/defer', pagosController.defer);

module.exports = router; 