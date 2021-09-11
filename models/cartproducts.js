'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CartProducts.init({
    cart_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity_ordered: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CartProducts',
    underscored: true
  });
  return CartProducts;
};