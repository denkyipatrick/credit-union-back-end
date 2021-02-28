const axios = require("axios");
const nodemailer = require("nodemailer");

function sendReceivedSMS(fullName, phoneNumber) {
    const message = 
    `Hi ${fullName}, you are welcome to ${process.env.APP_NAME} Banking. ` + 
    `This is a friendly message to you that your registration has been received ` + 
    `and being processed. You will hear from us soon.`;

    return sendSMS("Lollands CU", message, phoneNumber);
}

function sendPasswordCreatedSMS(fullName, emailAddress, password, phoneNumber) {
    const message = 
    `Hi ${fullName}, your account has been successfully proccessed. ` + 
    `You can sign into your online account with the following credentials: ` + 
    `Email Address: ${emailAddress}, and password is: ${password}.`;

    return sendSMS("Lollands CU", message, phoneNumber);
}

function sendPasswordCreatedEmail(user, password) {
    const message = 
    `Hi ${user.firstName} ${user.lastName}, your account has been successfully processed. ` + 
    `You can sign into your online account with the following credentials: ` + 
    `Email Address: ${user.emailAddress}, password is: ${password}.`;
    
    return sendMail({
        subject: "Account Credentials Created!",
        html: message,
        text: message,
        altText: message,
        recipient: user.emailAddress
    })
}

function sendAccountCreatedSMS(fullName, userAccount, phoneNumber) {
    const message = `Hi ${fullName}, your ${userAccount.accountTypeName} Account has ` + 
    `been created. Your account number is: ${userAccount.accountNumber}, balance is: ` + 
    `USD ${userAccount.balance.toFixed(2)}. Sign in to find out more. ` + 
    `Enjoy ${process.env.APP_NAME} Banking.`;
    return sendSMS("Lollands CU", message, phoneNumber);
}

function sendAccountCreatedEmail(user, userAccount) {
    const message = `Hi ${user.firstName} ${user.lastName}, ` + 
    `your ${userAccount.accountTypeName} Account has ` + 
    `been created. Your account number is: ${userAccount.accountNumber}, balance is: ` + 
    `USD ${userAccount.balance.toFixed(2)}. Sign in to find out more. ` + 
    `Enjoy ${process.env.APP_NAME} Banking.`;
    return sendMail({
        recipient: user.emailAddress,
        subject: userAccount.accountTypeName + ' Account Created',
        html: message,
        text: message,
        altText: message
    });
}

function sendDepositTransactionEmail(user, transaction, message) {
    const transactionDate = new Date();

    if (!message) {
        message = `Dear ${user.firstName} ${user.lastName}, ` + 
        `Your account has been credited with amount of USD ` + 
        `${transaction.amount.toFixed(2)} on ${transactionDate.toDateString()} ` + 
        ``;
    }

    return sendMail({
        recipient: user.emailAddress,
        subject: 'Lollands Credit Union Account Credited',
        html: message,
        text: message,
        altText: message
    });
}

function sendTransferEMailToSender(user, message) {
    return sendMail({
        recipient: user.emailAddress,
        html: message,
        text: message,
        altText: message,
        subject: 'Lollands Credit Union Transfer Completed'
    });
}

function sendTransferEMailToReceiver(user, message) {
    return sendMail({
        recipient: user.emailAddress,
        html: message,
        text: message,
        altText: message,
        subject: 'Lollands Credit Union Transfer Completed'
    });
}

function sendSMS (sender = "Lollands CU", message = "", phoneNumber = "") {
    if (phoneNumber.length === 0) {
        phoneNumber === '0241876332'
    }
    
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

function sendWelcomeMail(fullName, recipientAddress) {
    const mailText = `Welcome to Lollands Credit Union ${fullName}. <br />` + 
    `Hi ${fullName}, we have received your account ` + 
    `details in our database. Be informed that we are ` + 
    `working on your account with absolute urgency. ` + 
    `Kindly be patient as we work on it. ` + 
    `You will be notified via SMS or Email as soon as ` + 
    `we finish setting it up. Stay Safe. <br />` + 
    `Lollands Credit Union Accounts Team.`;
    return sendMail({
        from: `"Lollands Credit Union" <${process.env.ACCOUNTS_EMAIL_ADDRESS}>`,
        recipient: recipientAddress,
        html: mailText,
        altText: mailText,
        text: mailText,
        subject: `Welcome to Lollands Credit Union`
    })
}

function sendMail(payload) {
	const transport = nodemailer.createTransport({
		host: "smtp.zoho.com",
		port: 587,
		auth: {
			user: process.env.ACCOUNTS_EMAIL_ADDRESS,
			pass: process.env.ACCOUNTS_EMAIL_PASSWORD
		}
	});

	const mailOptions = {
        from: `"Lollands Credit Union" <${process.env.ACCOUNTS_EMAIL_ADDRESS}>`,
		to: payload.recipient,
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
    sendTransferEMailToSender,
    sendTransferEMailToReceiver,
    sendDepositTransactionEmail,
    sendAccountCreatedSMS,
    sendPasswordCreatedSMS,
    sendAccountCreatedEmail,
    sendPasswordCreatedEmail
}