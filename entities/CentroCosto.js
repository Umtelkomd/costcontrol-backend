require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.CentroCosto = new EntitySchema({
  name: 'CentroCosto',
  tableName: 'centros_costo',
  columns: {
    id: { type: Number, primary: true, generated: true },
    nombre: { type: String },
    descripcion: { type: String, nullable: true },
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true },
  },
}); 