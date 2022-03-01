'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
      },
      cart_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
      },
      date_ordered: {
        type: Sequelize.STRING
      },
      stripe_confirmation: {
        type: Sequelize.STRING
      },
      total_cost: {
        type: Sequelize.FLOAT
      },
      payment_received: {
        type: Sequelize.BOOLEAN
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Orders');
  }
};