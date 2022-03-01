'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserPaymentMethods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      card_number: {
        type: Sequelize.STRING
      },
      stripe_customer_id: {
        type: Sequelize.STRING
      },
      payment_method_id: {
        type: Sequelize.STRING
      },
      card_brand: {
        type: Sequelize.STRING
      },
      last_4: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserPaymentMethods');
  }
};