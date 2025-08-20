'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee',
      });
    }
  }

  Attendance.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    employee_id: { // Make sure employee_id is defined
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    check_in_location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    check_out_location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    qr_code_used: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('present', 'late', 'absent', 'on_leave', 'holiday'),
      defaultValue: 'absent',
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Attendance',
    tableName: 'attendances',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'date']
      }
    ]
  });

  return Attendance;
};