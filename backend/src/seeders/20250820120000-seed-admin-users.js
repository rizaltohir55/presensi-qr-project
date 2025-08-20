'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 10;
    const usersToInsert = [];

    for (let i = 1; i <= 2; i++) {
      const username = `admin${i}`;
      const existingUser = await queryInterface.rawSelect('users', {
        where: {
          username: username
        },
      }, ['id']);

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password', saltRounds); // Password default: "password"
        usersToInsert.push({
          id: uuidv4(),
          username: username,
          password_hash: hashedPassword,
          role: 'admin',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('users', usersToInsert, {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      username: {
        [Sequelize.Op.like]: 'admin%'
      }
    }, {});
  }
};