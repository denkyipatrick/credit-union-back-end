
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { sendReceivedSMS, sendPasswordCreatedSMS } = require('../utility');
const { AccountType, User, UserAccount, Sequelize, sequelize } = require('../sequelize/models/index');

module.exports = app => {
    app.get('/api/v1/users', (req, res) => {
        User.findAll({
            include: ['accounts']
        })
        .then(users => {
            res.send(users);
        })
        .catch(error => {
            res.sendStatus(500);
            console.error(error);
        })
    });

    app.get('/api/v1/users/:id', (req, res) => {
        User.findByPk(req.params.id, {
            include: ['accounts']
        })
        .then(users => {
            res.send(users);
        })
        .catch(error => {
            res.sendStatus(500);
            console.error(error);
        })
    });

    app.get('/api/v1/users/:id/accounts', (req, res) => {
        User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    {id: req.params.id},
                    {phoneNumber: req.params.id},
                    {emailAddress: req.params.id}
                ]
            },
            include: ['accounts']
        })
        .then(user => {
            if (!user) {
                res.sendStatus(404);
                return Promise.reject();
            }

            return UserAccount.findAll({
                include: ['owner'],
                where: {
                    userId: user.id
                }
            })
        })        
        .then(userAccounts => {
            res.send(userAccounts);
        })
        .catch(error => {
            if (error) {
                res.sendStatus(500);
                console.log(error);
            }
        });
    });

    app.post('/api/v1/users/auth', (req, res) => {
        User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { phoneNumber: req.body.id || '' },
                    { emailAddress: req.body.id || '' }
                ]
            },
            include: ['accounts']
        })
        .then(user => {
            if (!user) {
                res.sendStatus(404);
                return Promise.reject();
            }

            return Promise.resolve(user);
        })
        .then(user => {
            if (!bcryptjs.compareSync(req.body.password, user.password)) {
                res.sendStatus(400);
                return Promise.reject();
            }

            return Promise.resolve(user);
        })
        .then(foundUser => {
            res.send(foundUser);
            //     user: foundUser,
            //     token: jwt.sign(foundUser.emailAddress, 
            //         process.env.APPLICATION_JWT_SECRET)
            // })
        })
        .catch(error => {
            if (error) {
                res.sendStatus(500);
                console.log(error);
            }
        })
    });

    app.post('/api/v1/users', (req, res) => {
        console.log(req.body);

        sequelize.transaction(t => {
            let newUser = null;

            return User.findOne({
                where: {
                    [Sequelize.Op.or]: [
                        // { phoneNumber: req.body.phone },
                        { emailAddress: req.body.email }
                    ]
                }
            })
            .then(account => {
                if (account) {
                    res.sendStatus(400);
                    return Promise.reject();
                }
            })
            .then(() => {
                return User.create({
                    accountType: req.body.accountType,
                    lastName: req.body.lastName || req.body.lName,
                    firstName: req.body.firstName || req.body.fName,
                    phoneNumber: req.body.phoneNumber || req.body.phone,
                    emailAddress: req.body.emailAddress || req.body.email
                })
            })
            .then(createdUser => {
                newUser = createdUser;
            })
            .then(() => {
                return sendReceivedSMS(
                    req.body.fName + ' ' + req.body.lName, 
                    req.body.phone
                );
            })
            .then(() => {
                res.status(201).send(newUser);
            })
            .catch(error => {
                if (error) {
                    t.rollback();
                    res.sendStatus(500);
                    console.log(error);
                }
            });
        })
    });

    app.put('/api/v1/users/:id/setuserpassword', (req, res) => {
        sequelize.transaction(t => {
            let user = null;
            User.update({
                password: bcryptjs.hashSync(req.body.password, 10)
            }, {
                where: { id: req.params.id }
            })
            .then(() => {
                return User.findByPk(req.params.id);
            })
            .then(updatedUser => {
                user = updatedUser;
            })
            .then(() => {
                console.log(user);
                return sendPasswordCreatedSMS(
                    user.firstName + ' ' + user.lastName, 
                    user.emailAddress,
                    req.body.password,
                    user.phoneNumber
                    )           
            })
            .then(() => {
                res.status(201).send(user);
            })
            .catch(error => {
                if (error) {
                    t.rollback();
                    res.sendStatus(500);
                    console.error(error);
                }
            })
        });
    });
}