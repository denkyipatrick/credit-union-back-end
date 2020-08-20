
const {AccountType} = require('../sequelize/models/index');

module.exports = app => {
    app.get('/api/v1/accounttypes', (req, res) => {
        AccountType.findAll({
            order: [['name', 'ASC']]
        })
        .then(accountTypes => {
            res.send(accountTypes);
        })
        .catch(error => {
            res.sendStatus(500);
            console.log(error);
        })
    });

    app.post('/api/v1/accounttypes', (req, res) => {     
        AccountType.findOne({
            where: { name: req.body.name }
        })
        .then(accountType => {
            if (accountType) {
                res.sendStatus(406);
                return Promise.reject();
            }
        })
        .then(() => {            
            return AccountType.create({
                name: req.body.name.replace('Account', "").replace("account", "")
            });
        })
        .then(accountType => {
            res.status(201).send(accountType);
        })
        .catch(error => {
            res.sendStatus(500);
            console.error(error);
        })
    })
}