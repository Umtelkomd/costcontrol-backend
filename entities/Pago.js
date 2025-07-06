require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.Pago = new EntitySchema({
  name: 'Pago',
  tableName: 'pagos',
  columns: {
    id: { type: Number, primary: true, generated: true },
    fecha: { type: Date },
    proveedor: { type: String },
    concepto: { type: String },
    monto: { type: 'decimal', precision: 10, scale: 2 },
    centroCostoId: { type: Number },
    metodoPago: { type: String },
    referencia: { type: String, nullable: true },
    comentarios: { type: String, nullable: true },
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true },
  },
}); 