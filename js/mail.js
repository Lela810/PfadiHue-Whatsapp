const nodemailer = require('nodemailer');



function sendNotificationMail(mail, subject, grades) {

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

module.exports = { sendNotificationMail }