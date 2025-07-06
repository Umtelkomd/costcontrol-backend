require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.Configuracion = new EntitySchema({
  name: 'Configuracion',
  tableName: 'configuracion',
  columns: {
    id: { type: Number, primary: true, generated: true },
    nombreEmpresa: { type: String },
    moneda: { type: String },
    formatoFecha: { type: String },
    ultimaActualizacion: { type: 'datetime', updateDate: true },
  },
}); 