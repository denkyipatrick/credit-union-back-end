'use strict';
module.exports = (sequelize, DataTypes) => {
  const MoneyTransfer = sequelize.define('MoneyTransfer', {
    id: { primaryKey: true, type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 },
    senderAccountId: { type: DataTypes.UUID },
    receiverAccountId: { type: DataTypes.UUID },
    amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdAt: {type: DataTypes.BIGINT, defaultValue: new Date().getTime()},
    updatedAt: {type: DataTypes.BIGINT, defaultValue: new Date().getTime()}
  }, {});
  MoneyTransfer.associate = function(models) {
    // associations can be defined here
    MoneyTransfer.belongsTo(models.UserAccount, {
      foreignKey: 'senderAccountId',
      as: 'senderAccount'
    });

    MoneyTransfer.belongsTo(models.UserAccount, {
      foreignKey: 'receiverAccountId',
      as: 'receiverAccount'
    })
  };
  return MoneyTransfer;
};