const { AppDataSource } = require('../data-source');
const { Configuracion } = require('../entities/Configuracion');

exports.getConfig = async (req, res) => {
  try {
    const config = await AppDataSource.getRepository(Configuracion).findOneBy({ id: 1 });
    if (!config) return res.status(404).json({ error: 'No hay configuración' });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Configuracion);
    let config = await repo.findOneBy({ id: 1 });
    if (!config) return res.status(404).json({ error: 'No hay configuración' });
    repo.merge(config, req.body);
    await repo.save(config);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 