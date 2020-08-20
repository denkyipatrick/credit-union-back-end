
const { 
    AccountType, 
    Transaction, 
    User, 
    UserAccount, 
    Sequelize
} = require('../sequelize/models/index');

module.exports = app => {
    app.post('/api/v1/transactions', (req, res) => {
        console.log(req.body);
        
        Transaction.create({
            userAccountId: req.body.accountId,
            amount: req.body.amount,
            type: req.body.type.toLowerCase()
        })
        .then(transaction => {
            res.status(201).send(transaction);
            console.log(transaction);
        })
        .catch(error => {
            if (error) {
                res.sendStatus(500);
                console.log(error);
            }
        })
    })
}