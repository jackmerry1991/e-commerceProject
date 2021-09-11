'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.Cart, {
        foreignKey: 'cart_id',
        as: 'cart'
      });

      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

    }
  };
  Order.init({
    user_id: DataTypes.INTEGER,
    date_ordered: DataTypes.STRING,
    total_cost: DataTypes.FLOAT,
    payment_received: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Order',
    underscored: true
  });
  return Order;
};