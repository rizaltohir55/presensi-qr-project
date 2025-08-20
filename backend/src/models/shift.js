'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    static associate(models) {
      Shift.hasMany(models.Employee, {
        foreignKey: 'shift_id',
        as: 'employees',
      });
      Shift.hasMany(models.QRCode, {
        foreignKey: 'shift_id',
        as: 'qrCodes',
      });
    }
  }

  Shift.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Shift',
    tableName: 'shifts',
    timestamps: true,
    underscored: true,
  });

  return Shift;
};