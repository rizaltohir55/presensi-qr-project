'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 10;
    const usersToInsert = [];
    const employeesToInsert = [];

    for (let i = 1; i <= 5; i++) {
      const username = `employee${i}`;
      const existingUser = await queryInterface.rawSelect('users', {
        where: {
          username: username
        },
      }, ['id']);

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password', saltRounds); // Password default: "password"
        const userId = uuidv4();

        usersToInsert.push({
          id: userId,
          username: username,
          password_hash: hashedPassword,
          role: 'employee',
          created_at: new Date(),
          updated_at: new Date()
        });

        employeesToInsert.push({
          id: uuidv4(),
          user_id: userId,
          name: `Employee ${i}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('users', usersToInsert, {});
    }
    if (employeesToInsert.length > 0) {
      await queryInterface.bulkInsert('employees', employeesToInsert, {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      username: {
        [Sequelize.Op.like]: 'employee%'
      }
    }, {});
    await queryInterface.bulkDelete('employees', {
      name: {
        [Sequelize.Op.like]: 'Employee%'
      }
    }, {});
  }
};