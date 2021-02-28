
const { 
    Currency,
    Sequelize,
    sequelize
} = require('../sequelize/models/index');

module.exports = app => {
    app.get('/api/v1/currencies', async (req, res) => {
        try {
            res.send(await Currency.findAll());
        } catch(error) {
            res.sendStatus(500);
            console.error(error);
        }
    });

    app.put('/api/v1/currencies/:id', async (req, res) => {
        try {
            await Currency.update({
                rate: req.body.rate
            }, {
                where: { id: req.params.id }
            });

            res.send()
        } catch(error) {
            res.sendStatus(500);
            console.error(error);
        }
    })
}