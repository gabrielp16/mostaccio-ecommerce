const mongoose = require('mongoose')

const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z]+:[a-z]+$/,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Permission', permissionSchema)
