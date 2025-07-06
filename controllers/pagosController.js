const { AppDataSource } = require('../data-source');
const { Pago } = require('../entities/Pago');

exports.getAll = async (req, res) => {
  try {
    const pagos = await AppDataSource.getRepository(Pago).find();
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
    const nuevoPago = repo.create(req.body);
    const saved = await repo.save(nuevoPago);
    res.status(201).json({ id: saved.id });
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