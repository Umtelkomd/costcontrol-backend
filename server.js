const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { AppDataSource } = require('./data-source');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Import modular routes
const centrosCostoRoutes = require('./routes/centrosCosto');
const pagosRoutes = require('./routes/pagos');
const cuentasPorPagarRoutes = require('./routes/cuentasPorPagar');
const configuracionRoutes = require('./routes/configuracion');
const usersRoutes = require('./routes/users');

app.use('/api/centros-costo', centrosCostoRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/cuentas-por-pagar', cuentasPorPagarRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
  res.send('API Sistema de Pagos funcionando');
});

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor backend escuchando en puerto ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error al inicializar TypeORM:', err);
  }); 