'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tables = ['users', 'employees', 'shifts', 'locations', 'qr_codes', 'attendances'];
    for (const table of tables) {
      await queryInterface.addColumn(table, 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await queryInterface.addColumn(table, 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tables = ['users', 'employees', 'shifts', 'locations', 'qr_codes', 'attendances'];
    for (const table of tables) {
      await queryInterface.removeColumn(table, 'created_at');
      await queryInterface.removeColumn(table, 'updated_at');
    }
  }
};