'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const adminId = uuidv4();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password', saltRounds); // Password default: "password"

    // Cek apakah username admin sudah ada
    const existingUser = await queryInterface.rawSelect('users', {
      where: {
        username: 'admin'
      },
    }, ['id']);

    if (!existingUser) {
      await queryInterface.bulkInsert('users', [{
        id: adminId,
        username: 'admin',
        password_hash: hashedPassword,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }], {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'admin' }, {});
  }
};