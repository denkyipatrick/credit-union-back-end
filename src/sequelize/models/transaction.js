'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: { 
      primaryKey: true, 
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    userAccountId: { allowNull: false, type: DataTypes.UUID },
    type: { allowNull: false, type: DataTypes.STRING },
    amount: { allowNull: false, type: DataTypes.DOUBLE },
    createdAt: {
      type: DataTypes.BIGINT,
      defaultValue: new Date().getTime()},
    updatedAt: {
      type: DataTypes.BIGINT,
      defaultValue: new Date().getTime()
    }
  }, {});
  Transaction.associate = function(models) {
    // associations can be defined here
    Transaction.belongsTo(models.UserAccount, {
      foreignKey: 'userAccountId',
      as: 'account'
    })
  };
  return Transaction;
};