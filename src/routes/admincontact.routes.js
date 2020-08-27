const {sendSMS} = require('../utility');

module.exports = app => {
    app.post('/api/v1/admincontacts', (req, res) => {
        console.log(req.body);

        const message = `Name: ${req.body.fName} ${req.body.lName}, ` + 
        `Phone: ${req.body.phone}, email: ${req.body.email}. ` + 
        `Message: ${req.body.questionsOrComments}`;

        sendSMS("BSVCONTACT", message, "0241876332")
        .then(() => {
            res.send(req.body);
        })
        .catch(error => {
            res.sendStatus(500);
            console.log(error);
        })
    })
}