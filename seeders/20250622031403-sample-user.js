'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // パスワードは実際にはハッシュ化して保存してください
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Taro Yamada',
        pass: 'yamada',
        mail: 'taro@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hanako Suzuki',
        pass: 'flower',
        mail: 'hanako@example.com',
        age: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jiro Tanaka',
        pass: 'change',
        mail: 'jiro@example.com',
        age: 42,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sachiko',
        pass: 'happy',
        mail: 'sachiko@happy.com',
        age: 28,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
