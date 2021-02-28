'use strict';
module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define('Currency', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    currency: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    rate: {
      type: DataTypes.FLOAT
    },
    createdAt: {
      type: DataTypes.BIGINT,
      defaultValue: new Date().getTime()
    },
    updatedAt: {
      type: DataTypes.BIGINT,
      defaultValue: new Date().getTime()
    }
  }, {});
  Currency.associate = function(models) {
    // associations can be defined here
  };
  return Currency;
};