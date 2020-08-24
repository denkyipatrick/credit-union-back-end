
const { 
    AccountType, 
    Transaction, 
    User, 
    UserAccount,
    MoneyTransfer,
    Sequelize,
    sequelize
} = require('../sequelize/models/index');
const { sendMail, sendSMS } = require('../utility');

module.exports = app => {
    app.post('/api/v1/moneytransfers', (req, res) => {
        console.log(req.body);
        sequelize.transaction(t => {
            let senderAccount = null;
            let receiverAccount = null;
            let createdTransfer = null;

            return UserAccount.findByPk(req.body.senderAccountId, { include: ['owner'] })
            .then(account => {
                if (!account) { 
                    res.sendStatus(404)
                    return Promise.reject();
                 }
                senderAccount = account;
            })
            .then(() => {
                return UserAccount.findByPk(req.body.receiverAccountId, { include: ['owner'] })
            })
            .then(userAccount => {
                if (!userAccount) {
                    res.sendStatus(406);
                    return Promise.reject();
                }
                receiverAccount = userAccount;
            })
            .then(() => {
                if (!senderAccount.balance - +req.body.amount > 0) {
                    res.status(400).send()
                    return Promise.reject();
                }
            })
            .then(() => {
                return MoneyTransfer.create({
                    amount: +req.body.amount,
                    senderAccountId: senderAccount.id,
                    receiverAccountId: receiverAccount.id
                })
            })
            .then(transfer => {
                return MoneyTransfer.findByPk(transfer.id, {
                    include: [
                        { model: UserAccount, as:  'receiverAccount', include: 'owner'}
                    ]
                })
            })
            .then(transfer => {                
                createdTransfer = transfer;
            })
            .then(() => {
                return Transaction.create({
                    type: 'deposit',
                    amount: +req.body.amount,
                    userAccountId: receiverAccount.id
                })
            })
            .then(() => {
                return sequelize.query(`Update UserAccounts set ` + 
                `balance = balance - ${+req.body.amount} ` + 
                `where id = '${senderAccount.id}'`)
            })
            .then(() => {
                return sequelize.query(`Update UserAccounts set ` + 
                `balance = balance + ${+req.body.amount} ` + 
                `where id = '${receiverAccount.id}'`)
            })
            .then(() => {
                const message = 
                `You have transfered USD ${(+req.body.amount).toFixed(2)} to ` + 
                `${receiverAccount.owner.firstName} ${receiverAccount.owner.lastName} ` + 
                `from your ${senderAccount.accountTypeName} Account. ` + 
                `Account number ${senderAccount.accountNumber}, ` + 
                `previous balance USD ${(senderAccount.balance + +req.body.amount).toFixed(2)}, new balance ` + 
                `USD ${(senderAccount.balance).toFixed(2)}`;

                if (process.env.SEND_SMS == "yes") {
                    return sendSMS("BSV Online", message, senderAccount.owner.phoneNumber);
                }
            })
            .then(() => {
                const message = 
                `You have received USD ${(+req.body.amount).toFixed(2)} from ` + 
                `${senderAccount.owner.firstName} ${senderAccount.owner.lastName} ` + 
                `into your ${receiverAccount.accountTypeName} Account.` + 
                `Account number ${receiverAccount.accountNumber}, ` + 
                `previous balance USD ${receiverAccount.balance.toFixed(2)}, ` + 
                `new balance USD ${(receiverAccount.balance + +req.body.amount).toFixed(2)}`;

                if (process.env.SEND_SMS == "yes") {
                    return sendSMS("BSV Online", message, receiverAccount.owner.phoneNumber);
                }
            })
            .then(() => {
                res.status(201).send(createdTransfer);
            })
            .catch(error => {
                if (error) {
                    t.rollback();
                    res.sendStatus(500);
                    console.log(error);
                }
            });
        });
    })
}