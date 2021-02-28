
const { 
    AccountType, 
    Transaction, 
    User, 
    UserAccount, 
    MoneyTransfer,
    Sequelize,
    sequelize
} = require('../sequelize/models/index');

const { sendAccountCreatedSMS, sendAccountCreatedEmail } = require('../utility');

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
    });

    app.get('/api/v1/useraccounts/:id', async (req, res) => {
        try {
            const account = await UserAccount.findByPk(req.params.id, {
                include: [{model: Transaction, as: 'transactions', include: ['account']},
                { model: MoneyTransfer, as: 'transfers', include: [
                    { model: UserAccount, as: 'receiverAccount', include: ['owner'] }
                ] }
                ]
            });

            const deposits = await Transaction.findAll({
                where: {
                    userAccountId: account.id,
                    type: 'deposit'
                },
                include: ['account']
            });
            
            const withdrawals = await Transaction.findAll({
                where: {
                    userAccountId: account.id,
                    type: 'withdrawal'
                },
                include: ['account']
            });

            account.setDataValue('deposits', deposits);
            account.setDataValue('withdrawals', withdrawals);

            // console.log(account);
            res.send(account);

        } catch(error) {
            res.sendStatus(500);
            console.error(error);
        }

        // UserAccount.findByPk(req.params.id, {
        //     include: [{model: Transaction, as: 'transactions', include: ['account']},
        //     { model: MoneyTransfer, as: 'transfers', include: [
        //         { model: UserAccount, as: 'receiverAccount', include: ['owner'] }
        //     ] }
        // ]
        // })
        // .then(userAccount => {
        //     res.send(userAccount);
        // })
        // .catch(error => {
        // })
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
            console.error(error);
        })
    });

    app.get('/api/v1/useraccounts/:id/transactions', (req, res) => {
        Transaction.findAll({
            where: { userAccountId: req.params.id },
            include: ['account']
        })
        .then(deposits => {
            res.send(deposits);
        })
        .catch(error => {
            res.sendStatus(500);
            console.error(error);
        })
    })

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
                    accountTypeName: req.body.accountTypeName || req.body.accountType
                }, {
                    transaction: t
                });
            })
            .then(createdUserAccount => {
                createdAccount = createdUserAccount;
            })
            .then(() => {
                return Transaction.create({
                    type: 'deposit',
                    amount: +req.body.balance,
                    userAccountId: createdAccount.id
                }, {
                    transaction: t
                })
            })
            .then(() => {
                sendAccountCreatedEmail(user, createdAccount);

                if (process.env.SEND_SMS == "yes") {
                    return sendAccountCreatedSMS(user.firstName + ' ' + user.lastName, 
                        createdAccount, user.phoneNumber);
                }
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