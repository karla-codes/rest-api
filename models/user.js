'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Course, {
        foreignKey: {
          fieldName: 'userId',
          allowNull: false,
        },
      });
    }
  }

  // User.associate = model => {
  //   User.hasMany(models.Course, {
  //     foreignKey: {
  //       fieldName: 'userId',
  //       allowNull: false,
  //     },
  //   });
  // };

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'A first name is required',
          },
          notEmpty: {
            msg: 'Please provide a first name',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'A last name is required',
          },
          notEmpty: {
            msg: 'Please provide a last name',
          },
        },
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'The email you entered already exists',
        },
        validate: {
          notNull: {
            msg: 'An email is required',
          },
          isEmail: {
            msg: 'Please provide a valid email address',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'A password is required',
          },
          notEmpty: {
            msg: 'Please provide a password',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  return User;
};
