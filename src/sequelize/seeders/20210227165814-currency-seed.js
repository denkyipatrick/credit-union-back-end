'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
   return queryInterface.bulkInsert('Currencies', [
    { id: 'euro_currency', 
      currency: 'Euro', 
      name: 'USD_EUR', 
      rate: 0.83, 
      createdAt: new Date().getTime(), 
      updatedAt: new Date().getTime()
    },
    { id: 'usd_currency', 
      currency: 'Dollar', 
      name: 'EUR_USD', 
      rate: 1, 
      createdAt: new Date().getTime(), 
      updatedAt: new Date().getTime()
    }
   ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
