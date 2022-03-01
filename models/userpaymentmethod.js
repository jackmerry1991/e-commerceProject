'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPaymentMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserPaymentMethod.belongsTo(models.User, {
        foreignKey:'user_id'
      })
    }
  };

  UserPaymentMethod.init({
    user_id: DataTypes.INTEGER,
    card_number: DataTypes.STRING,
    stripe_customer_id: DataTypes.STRING,
    payment_method_id: DataTypes.STRING,
    card_brand: DataTypes.STRING,
    last_4: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserPaymentMethod',
  });
  return UserPaymentMethod;
};