const { AppDataSource } = require('../data-source');
const { Pago } = require('../entities/Pago');
const { CentroCosto } = require('../entities/CentroCosto');
const { User } = require('../entities/User');
const slackService = require('../services/slackService');

exports.getAll = async (req, res) => {
  try {
    const pagos = await AppDataSource.getRepository(Pago).find();
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pending payments for approval
exports.getPending = async (req, res) => {
  try {
    const pagos = await AppDataSource.getRepository(Pago).find({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' }
    });
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get approved payments
exports.getApproved = async (req, res) => {
  try {
    const pagos = await AppDataSource.getRepository(Pago).find({
      where: { status: 'approved' },
      order: { reviewDate: 'DESC' }
    });
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const pago = await AppDataSource.getRepository(Pago).findOneBy({ id: Number(req.params.id) });
    if (!pago) return res.status(404).json({ error: 'No encontrado' });
    res.json(pago);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Pago);
    const nuevoPago = repo.create({
      ...req.body,
      status: req.body.status || 'pending', // Use provided status or default to pending
      createdByUserId: req.body.createdByUserId || null
    });
    const saved = await repo.save(nuevoPago);
    
    // Enviar notificación de Slack solo si el pago está pendiente
    if (saved.status === 'pending') {
      try {
        // Obtener información adicional para la notificación
        const centroRepo = AppDataSource.getRepository(CentroCosto);
        const userRepo = AppDataSource.getRepository(User);
        
        const centro = await centroRepo.findOneBy({ id: saved.centroCostoId });
        const usuario = saved.createdByUserId ? await userRepo.findOneBy({ id: saved.createdByUserId }) : null;
        
        await slackService.sendNewPaymentNotification(
          saved,
          centro?.nombre || 'Centro no encontrado',
          usuario?.name || 'Usuario no encontrado'
        );
      } catch (slackError) {
        console.error('Error al enviar notificación de Slack:', slackError);
        // No fallar la creación del pago por error de Slack
      }
    }
    
    res.status(201).json({ id: saved.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  // Approve a payment
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedByUserId, reviewComments } = req.body;

    const repo = AppDataSource.getRepository(Pago);
    const pago = await repo.findOneBy({ id: Number(id) });
    
    if (!pago) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (pago.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending payments can be approved' });
    }

    // Update payment to approved
    pago.status = 'approved';
    pago.reviewedByUserId = reviewedByUserId;
    pago.reviewDate = new Date();
    pago.reviewComments = reviewComments || null;

    await repo.save(pago);
    
    // Enviar notificación de Slack de aprobación
    try {
      const centroRepo = AppDataSource.getRepository(CentroCosto);
      const userRepo = AppDataSource.getRepository(User);
      
      const centro = await centroRepo.findOneBy({ id: pago.centroCostoId });
      const usuario = reviewedByUserId ? await userRepo.findOneBy({ id: reviewedByUserId }) : null;
      
      await slackService.sendPaymentApprovedNotification(
        pago,
        centro?.nombre || 'Centro no encontrado',
        usuario?.name || 'Usuario no encontrado'
      );
    } catch (slackError) {
      console.error('Error al enviar notificación de aprobación:', slackError);
    }
    
    res.json({ message: 'Payment approved successfully', pago });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Defer a payment (move to accounts payable)
exports.defer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedByUserId, reviewComments, dueDate } = req.body;

    const repo = AppDataSource.getRepository(Pago);
    const cuentasPorPagarRepo = AppDataSource.getRepository('CuentaPorPagar');
    
    const pago = await repo.findOneBy({ id: Number(id) });
    
    if (!pago) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (pago.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending payments can be deferred' });
    }

    // Create the account payable
    const newAccountPayable = cuentasPorPagarRepo.create({
      fecha: pago.fecha,
      fechaVencimiento: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      proveedor: pago.proveedor,
      concepto: pago.concepto,
      monto: pago.monto,
      centroCostoId: pago.centroCostoId,
      estado: 'pendiente',
      comentarios: `Diferido: ${reviewComments ? '. ' + reviewComments : ''}`
    });

    await cuentasPorPagarRepo.save(newAccountPayable);

    // Update payment to deferred
    pago.status = 'deferred';
    pago.reviewedByUserId = reviewedByUserId;
    pago.reviewDate = new Date();
    pago.reviewComments = reviewComments || null;

    await repo.save(pago);

    // Enviar notificación de Slack de diferimiento
    try {
      const centroRepo = AppDataSource.getRepository(CentroCosto);
      const userRepo = AppDataSource.getRepository(User);
      
      const centro = await centroRepo.findOneBy({ id: pago.centroCostoId });
      const usuario = reviewedByUserId ? await userRepo.findOneBy({ id: reviewedByUserId }) : null;
      
      await slackService.sendPaymentDeferredNotification(
        pago,
        centro?.nombre || 'Centro no encontrado',
        usuario?.name || 'Usuario no encontrado',
        reviewComments
      );
    } catch (slackError) {
      console.error('Error al enviar notificación de diferimiento:', slackError);
    }

    res.json({ 
      message: 'Payment deferred successfully and moved to accounts payable', 
      pago, 
      accountPayable: newAccountPayable 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Pago);
    const pago = await repo.findOneBy({ id: Number(req.params.id) });
    if (!pago) return res.status(404).json({ error: 'No encontrado' });
    repo.merge(pago, req.body);
    await repo.save(pago);
    res.json({ id: pago.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Pago);
    const pago = await repo.findOneBy({ id: Number(req.params.id) });
    if (!pago) return res.status(404).json({ error: 'No encontrado' });
    await repo.remove(pago);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 