'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cart.belongsToMany(models.Product, {
        through: 'cart_products',
        as: 'product',
        foreignKey: 'cart_id',
      });

      Cart.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
    }
  };
  Cart.init({
    user_id: DataTypes.INTEGER,
    checked_out: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Cart',
    underscored: true
  });
  return Cart;
};