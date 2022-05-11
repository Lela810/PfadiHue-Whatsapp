const nodemailer = require('nodemailer');



function sendNotificationMail(mail, message) {

    const transporter = nodemailer.createTransport({
        host: 'mail.lklaus.ch',
        port: 587,
        auth: {
            user: 'no-reply@lklaus.ch',
            pass: process.env.MAILPWD
        }
    });


    const notificationMailHtml = `
        <html>
            <body>
                
                    <h2>${grades.name}</h2>
                    <h3>${grades.subject}</h3>
                    <h2 style="text-decoration: underline">${grades.grades}</h2>
                    <h3>${grades.date}</h3>
                    
            </body>
        </html>`;



    const mailOptions = {
        from: 'no-reply@lklaus.ch',
        to: mail,
        subject: subject,
        html: notificationMailHtml
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        }
    });

}



function sendQrMail(mail) {

    const transporter = nodemailer.createTransport({
        host: 'mail.lklaus.ch',
        port: 587,
        auth: {
            user: 'no-reply@lklaus.ch',
            pass: process.env.MAILPWD
        }
    });


    const mailHtml = `
        <html>
        <head>
            <style>
                div { 
                    width: 512px; 
                    height: 512px; 
                    background-color: #FFFFFF; 
                }
                img {
                    margin: 30px;
                    background-color: #FFFFFF; 
                    display: block;
                }
            </style>
        </head>
            <body>
                <div>
                    <img src="cid:QRCode"/>
                </div>     
            </body>
        </html>`;


    const mailOptions = {
        from: 'no-reply@lklaus.ch',
        to: mail,
        subject: "Pfadi Hü Whatsapp requires your Attention!",
        html: mailHtml,
        attachments: [{
            filename: 'qr.png',
            path: 'qr.png',
            cid: 'QRCode'
        }]
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        }
    });

}

module.exports = { sendQrMail }