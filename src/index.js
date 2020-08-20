const cors = require('cors');
const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const expressFileUploader = require('express-fileupload');

const application = express();

application.use(cors());
application.use(expressFileUploader());
application.use(bodyParser.json({urlencoded: true}));

require('./routes/user.routes')(application);
require('./routes/useraccount.routes')(application);
require('./routes/accounttype.routes')(application);
require('./routes/transaction.routes')(application);
require('./routes/moneytransfer.routes')(application);

if (process.env.USE_HTTPS.indexOf("yes") > -1) {    
    https.createServer({
        key: fs.readFileSync('./ssl/bsvnett_com.key'),
        cert: fs.readFileSync('./ssl/bsvnett_com.crt'),
        ca: fs.readFileSync('./ssl/bsvnett_com.ca-bundle')
    }, application).listen(process.env.NODE_PORT, () => {
        console.log('Application server running securely');
    });
} else {
    application.listen(process.env.NODE_PORT, () => {
        console.log('application is running on port ' + process.env.NODE_PORT);
    });
}
