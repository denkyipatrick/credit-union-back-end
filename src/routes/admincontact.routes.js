const {sendSMS, sendMail} = require('../utility');

module.exports = app => {
    app.post('/api/v1/admincontacts', (req, res) => {
        const message = `Name: ${req.body.fName} ${req.body.lName}, ` + 
        `Phone: ${req.body.phone}, email: ${req.body.email}. ` + 
        `Message: ${req.body.questionsOrComments}`;

        sendMail({
            recipient: 'contact@lollandscreditunion.com',
            html: message,
            altText: message,
            subject: 'Customer - Contact Us'
        })
        .then(() => {
            res.send(req.body);
        })
        .catch(error => {
            res.sendStatus(500);
            console.log(error);
        });

        // sendSMS("Lollands CU", message, "0241876332")
        // .then(() => {
        //     res.send(req.body);
        // })
        // .catch(error => {
        //     res.sendStatus(500);
        //     console.log(error);
        // })
    })
}