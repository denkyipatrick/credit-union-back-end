const axios = require("axios");
const nodemailer = require("nodemailer");

function sendReceivedSMS(fullName, phoneNumber) {
    const message = 
    `Hi ${fullName}, you are welcome to BSV Online Banking. ` + 
    `This is a friendly message to you that your input has been received ` + 
    `and being processed. You will hear from us soon.`;

    return sendSMS("BSV Online", message, phoneNumber);
}

function sendPasswordCreatedSMS(fullName, emailAddress, password, phoneNumber) {
    const message = 
    `Hi ${fullName}, your account has been successfully proccessed. ` + 
    `You can sign into your online account with the following credentials: ` + 
    `Email Address: ${emailAddress}, and password is: ${password}.`;

    return sendSMS("BSV Online", message, phoneNumber);
}

function sendAccountCreatedSMS(fullName, userAccount, phoneNumber) {
    const message = `Hi ${fullName}, your ${userAccount.accountTypeName} Account has ` + 
    `been created. Your account number is: ${userAccount.accountNumber}, balance is: ` + 
    `USD ${userAccount.balance.toFixed(2)}. Sign in to find out more. ` + 
    `Enjoy BSV Online Banking.`;
    return sendSMS("BSV Online", message, phoneNumber);
}

function sendSMS (sender = "BSV ONLINE", message = "", phoneNumber = "") {
	const url =
		`http://api.smsonlinegh.com/sendsms.php?` +
		`user=privoas@gmail.com&` +
		`password=Tjnqmf%hard&` +
		`message=${message}&` +
		`type=0&` +
		`sender=${sender}&` +
		`destination=${phoneNumber}`;

	return axios
		.post(url)
		.then(result => Promise.resolve(result))
		.catch(error => Promise.reject(error));
};

function sendWelcomeMail(fullName, recepientAddress) {
    const mailText = `
    <div>    
        <div style="text-align: center">
            <img src="../public/images/bsv_logo.png" style="width: 100px;" />>
        </div>
        <div>
            <p>            
                Hello <b>${fullName}</b>, We highly welcome you to BSV Community Bank.
            </p>
        </div>
    </div>`;
    return sendMail({
        from: `Welcome to BSV Online Banking <contact@bsvnett.com>`,
        recepient: recepientAddress,
        html: mailText,
        altText: mailText,
        subject: `${fullName}, BSV Welcomes`
    })
}
    
function sendMail(payload) {
	const transport = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.CONTACT_EMAIL_ADDRESS,
			pass: process.env.CONTACT_EMAIL_PASSWORD
		}
	});

	const mailOptions = {
		from: payload.from, // `Contact@BSVNETT <contact@bsvnett.com>`,
		to: payload.recepient,
		subject: payload.subject,
		html: payload.html,
		text: payload.altText
	};

	return new Promise((resolve, reject) => {
		transport.sendMail(mailOptions, (error, info) => {
			if (error) {
				reject(error);
			} else {
				resolve(info);
			}
		});
	});
}; // end sendMail

module.exports = {
    sendSMS,
    sendMail,
    sendReceivedSMS,
    sendWelcomeMail,
    sendAccountCreatedSMS,
    sendPasswordCreatedSMS
}