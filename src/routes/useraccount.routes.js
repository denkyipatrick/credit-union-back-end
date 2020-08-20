
const { 
    AccountType, 
    Transaction, 
    User, 
    UserAccount, 
    MoneyTransfer,
    Sequelize,
    sequelize
} = require('../sequelize/models/index');

const { sendAccountCreatedSMS } = require('../utility');

module.exports = app => {
    app.get('/api/v1/useraccounts/search', (req, res) => {
        UserAccount.findAll({
            where: {
                [Sequelize.Op.or]: [
                    // {'$owner.emailAddress': { [Sequelize.Op.like]:  `${req.query.q}%` } },
                    // {'$owner.phoneNumber': { [Sequelize.Op.like]:  `${req.query.q}%` } },
                    { accountNumber: { [Sequelize.Op.like]:  `${req.query.q}%` }   }
                ]
            },
            include: ['owner']
        })
        .then(accounts => {
            res.send(accounts);
        })
        .catch(error => {
            res.sendStatus(500);
            console.log(error);
        })
    });

    app.get('/api/v1/useraccounts', (req, res) => {
        UserAccount.findAll({
            include:['owner', 'account']
        })
        .then(accounts => {
            res.send(accounts);
        })
        .catch(error => {
            console.log(error);
        })
    })

    app.get('/api/v1/useraccounts/:id/deposits', (req, res) => {
        Transaction.findAll({
            where: {
                [Sequelize.Op.and]: [
                    { type: 'deposit' },
                    { userAccountId: req.params.id }
                ]
            },
            include: ['account']
        })
        .then(deposits => {
            res.send(deposits);
        })
        .catch(error => {
            res.sendStatus(500);
            console.log(error);
        })
    });
    
    app.get('/api/v1/useraccounts/:id/withdrawals', (req, res) => {
        Transaction.findAll({
            where: {
                [Sequelize.Op.and]: [
                    { type: 'withdrawal' },
                    { userAccountId: req.params.id }
                ]
            },
            include: ['account']
        })
        .then(deposits => {
            res.send(deposits);
        })
        .catch(error => {
            res.sendStatus(500);
            console.log(error);
        })
    });

    app.get('/api/v1/useraccounts/:id/transfers', (req, res) => {
        MoneyTransfer.findAll({
            where: { senderAccountId: req.params.id },
            include: [ { model: UserAccount, as: 'receiverAccount', include: ['owner'] } ]
        })
        .then(transfers => {
            res.send(transfers);
        })
        .catch(error => {
            res.sendStatus(500);
            console.log(error);
        })
    });

    app.post('/api/v1/useraccounts', (req, res) => {
        sequelize.transaction(t => {
            let user = null;
            let createdAccount = null;

            return User.findOne({
                where: {
                    [Sequelize.Op.or]: [
                        { id: req.body.userId },
                        { phoneNumber: req.body.userId },
                        { emailAddress: req.body.userId }
                    ]
                }
            })
            .then(createdUser => {
                if (!createdUser) {
                    res.sendStatus(404);
                    return Promise.reject();
                }

                user = createdUser;

                return UserAccount.create({
                    userId: createdUser.id,
                    balance: +req.body.balance,
                    accountNumber: req.body.accountNumber,
                    accountTypeName: req.body.accountName || req.body.accountType
                })
            })
            .then(createdUserAccount => {
                createdAccount = createdUserAccount;
            })
            .then(() => {
                return Transaction.create({
                    type: 'deposit',
                    amount: +req.body.balance,
                    userAccountId: createdAccount.id
                })
            })
            .then(() => {
                return sendAccountCreatedSMS(user.firstName + ' ' + user.lastName, createdAccount, user.phoneNumber);
            })
            .then(() => {
                res.status(201).send(createdAccount);
            })
            .catch(error => {
                if (error) {
                    t.rollback();
                    res.sendStatus(500);
                    console.log(error);
                }
            });
        });
    });
}