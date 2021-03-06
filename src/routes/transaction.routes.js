const {
  Transaction,
  UserAccount,
  Sequelize,
  sequelize,
} = require("../sequelize/models/index");

const {
  sendDebitTransactionEmail,
  sendDepositTransactionEmail,
} = require("../utility");

module.exports = (app) => {
  app.post("/api/v1/transactions", async (req, res) => {
    try {
      let transaction = await Transaction.create({
        userAccountId: req.body.accountId,
        amount: req.body.amount,
        type: req.body.type.toLowerCase(),
      });

      res.status(201).send(transaction);
    } catch (error) {
      res.sendStatus(500);
      console.log(error);
    }
  });

  app.post("/api/v1/transactions/deposit", (req, res) => {
    sequelize.transaction((t) => {
      let completedTransaction = null;

      return UserAccount.update(
        {
          balance: Sequelize.literal(`balance + ${+req.body.amount}`),
        },
        {
          transaction: t,
          where: { accountNumber: req.body.accountNumber },
        }
      )
        .then(() => {
          return Transaction.create(
            {
              userAccountId: req.body.userAccountId,
              amount: req.body.amount,
              type: "deposit",
            },
            { transaction: t }
          );
        })
        .then((transaction) => {
          completedTransaction = transaction;
        })
        .then(() => {
          return UserAccount.findOne({
            where: { id: req.body.userAccountId },
            include: ["owner"],
          });
        })
        .then((account) => {
          const message =
            `Hi ${account.owner.firstName}, your account has been deposited ` +
            `with the amount of USD ${(+req.body.amount).toFixed(2)}. ` +
            `Account Type: ${account.accountTypeName} Account, Account Number: (${account.accountNumber}). ` +
            `Current Balance: USD ${(
              account.balance + +req.body.amount
            ).toFixed(2)}`;

          // sendSMS('Lollands CU', message, '0241876332');
          return sendDepositTransactionEmail(
            account.owner,
            completedTransaction,
            message
          );
        })
        .then(() => {
          res.status(201).send(completedTransaction);
        })
        .catch((error) => {
          t.rollback();
          if (error) {
            res.sendStatus(500);
            console.log(error);
          }
        });
    });
  });

  app.post("/api/v1/transactions/withdraw", (req, res) => {
    sequelize.transaction((t) => {
      let completedTransaction = null;

      return UserAccount.update(
        {
          balance: Sequelize.literal(`balance - ${+req.body.amount}`),
        },
        {
          transaction: t,
          where: { accountNumber: req.body.accountNumber },
        }
      )
        .then(() => {
          return Transaction.create(
            {
              userAccountId: req.body.userAccountId,
              amount: req.body.amount,
              type: "withdrawal",
            },
            { transaction: t }
          );
        })
        .then((transaction) => {
          completedTransaction = transaction;
        })
        .then(() => {
          return UserAccount.findOne({
            where: { id: req.body.userAccountId },
            include: ["owner"],
          });
        })
        .then((account) => {
          const message =
            `Hi ${account.owner.firstName}, your account has been debited ` +
            `with the amount of USD ${(+req.body.amount).toFixed(2)}. ` +
            `Account Type: ${account.accountTypeName} Account, Account Number: (${account.accountNumber}). ` +
            `Current Balance: USD ${(
              account.balance + +req.body.amount
            ).toFixed(2)}`;

          // sendSMS('Lollands CU', message, '0241876332');
          return sendDebitTransactionEmail(
            account.owner,
            completedTransaction,
            message
          );
        })
        .then(() => {
          res.status(201).send(completedTransaction);
        })
        .catch((error) => {
          t.rollback();
          if (error) {
            res.sendStatus(500);
            console.log(error);
          }
        });
    });
  });
};
