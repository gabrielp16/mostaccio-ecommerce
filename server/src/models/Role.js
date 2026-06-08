const mongoose = require('mongoose')
const { PERMISSIONS } = require('../config/rbac')

const roleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z][a-z0-9_]*$/,
    },
    name: { type: String, required: true, trim: true },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (values) => values.every((value) => PERMISSIONS.includes(value)),
        message: 'Permisos invalidos en el rol',
      },
    },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Role', roleSchema)