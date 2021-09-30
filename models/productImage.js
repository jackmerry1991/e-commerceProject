'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductImage.belongsTo(models.Product, {
        foreignKey:'product_id'
      })
    }
  };
  ProductImage.init({
    product_id: DataTypes.INTEGER,
    image_name: DataTypes.STRING,
    image_priority: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'ProductImage',
    underscored: true
  });
  return ProductImage;
};