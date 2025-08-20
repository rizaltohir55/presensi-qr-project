'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QRCode extends Model {
    static associate(models) {
      QRCode.belongsTo(models.Location, {
        foreignKey: 'location_id',
        as: 'location',
      });
      QRCode.belongsTo(models.Shift, {
        foreignKey: 'shift_id',
        as: 'shift',
      });
      QRCode.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator',
      });
    }
  }

  QRCode.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('check_in', 'check_out', 'general'),
      allowNull: false,
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    shift_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'QRCode',
    tableName: 'qr_codes',
    timestamps: true,
    underscored: true,
  });

  return QRCode;
};