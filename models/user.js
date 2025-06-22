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
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: '名前を入力してください',
        },
      },
    },
    pass: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'パスワードを入力してください',
        },
      },
    },
    mail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: '有効なメールアドレスを入力してください',
        },
      },
    },
    age: {
      type: DataTypes.INTEGER,
      validate: {
        min: {
          args: [0],
          msg: '年齢は0以上で入力してください',
        },
        max: {
          args: [150],
          msg: '年齢は150以下で入力してください',
        },
        isInt: {
          msg: '年齢は整数で入力してください',
        },
      },
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};