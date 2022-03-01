'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Order, {
        foreignKey: "id",
      });

      User.belongsTo(models.Cart, {
        foreignKey:"id",
      });
    }
  };
  User.init({
    email: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    password: DataTypes.STRING,
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    post_code: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    underscored: true
  });
  return User;
};