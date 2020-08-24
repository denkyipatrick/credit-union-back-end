'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserAccount = sequelize.define('UserAccount', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID, 
      allowNull: false
    },
    accountNumber:{
      type: DataTypes.BIGINT,
      unique: true
    },
    balance: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    accountTypeName: { 
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {});
  UserAccount.associate = function(models) {
    // associations can be defined here
    UserAccount.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner'
    });

    UserAccount.belongsTo(models.AccountType, {
      foreignKey: 'accountTypeName',
      as: 'account'
    });

    UserAccount.hasMany(models.Transaction, {
      foreignKey: 'userAccountId',
      as: 'transactions'
    });

    UserAccount.hasMany(models.MoneyTransfer, {
      foreignKey: 'senderAccountId',
      as: 'transfers'
    });
    
    UserAccount.hasMany(models.MoneyTransfer, {
      foreignKey: 'receiverAccountId',
      as: 'receivedTransfers'
    })
  };
  return UserAccount;
};