require('reflect-metadata');
const { DataSource } = require('typeorm');
const { Pago } = require('./entities/Pago');
const { CentroCosto } = require('./entities/CentroCosto');
const { CuentaPorPagar } = require('./entities/CuentaPorPagar');
const { Configuracion } = require('./entities/Configuracion');
const { User } = require('./entities/User');
require('dotenv').config();
const fs = require('fs');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Cambia a true solo en desarrollo
  logging: false,
  entities: [Pago, CentroCosto, CuentaPorPagar, Configuracion, User],
  migrations: [],
  subscribers: [],
});

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('¿Existe .env?', fs.existsSync('./.env'));

module.exports = { AppDataSource }; 