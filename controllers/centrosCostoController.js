const { AppDataSource } = require('../data-source');
const { CentroCosto } = require('../entities/CentroCosto');

exports.getAll = async (req, res) => {
  try {
    const centros = await AppDataSource.getRepository(CentroCosto).find();
    res.json(centros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const centro = await AppDataSource.getRepository(CentroCosto).findOneBy({ id: Number(req.params.id) });
    if (!centro) return res.status(404).json({ error: 'No encontrado' });
    res.json(centro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CentroCosto);
    const nuevo = repo.create(req.body);
    const saved = await repo.save(nuevo);
    res.status(201).json({ id: saved.id, nombre: saved.nombre, descripcion: saved.descripcion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CentroCosto);
    const centro = await repo.findOneBy({ id: Number(req.params.id) });
    if (!centro) return res.status(404).json({ error: 'No encontrado' });
    repo.merge(centro, req.body);
    await repo.save(centro);
    res.json({ id: centro.id, nombre: centro.nombre, descripcion: centro.descripcion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CentroCosto);
    const centro = await repo.findOneBy({ id: Number(req.params.id) });
    if (!centro) return res.status(404).json({ error: 'No encontrado' });
    await repo.remove(centro);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 