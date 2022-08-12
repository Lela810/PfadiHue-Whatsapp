const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { sendQrMail } = require('./mail.js');
const QRCode = require('easyqrcodejs-nodejs');
const { whatsappGroup } = require('./whatsapp/whatsappGroup.js');
const { whatsappPrivate } = require('./whatsapp/whatsappPrivate.js');

async function startWhatsapp() {
    let client
    if (process.env.LOCAL_AUTH == 'false') {
        client = new Client();
    } else {
        client = new Client({
            authStrategy: new LocalAuth()
        });
    }


    client.on('qr', (qr) => {

        qrcode.generate(qr, { small: true });

        const options = {
            text: qr,
            correctLevel: QRCode.CorrectLevel.M,
            width: 512,
            height: 512
        };
        const qrcodeImage = new QRCode(options);
        qrcodeImage.saveImage({
            path: 'qr.png'
        });

        sendQrMail('leandro.klaus03@gmail.com');

    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    let users = new Object();
    let userActivityDate = new Object()
    let userActivityStart = new Object()
    let userActivityEnd = new Object()
    let whatsappGroupReturn

    client.on('message', async(message) => {

        const chat = await message.getChat()



        if (chat.isGroup) {
            const mentions = await message.getMentions();
            for (const contact of mentions) {
                if (contact.isMe) {
                    const user = await message.getContact()
                    if (!users[user.number] || users[user.number] == 'undefined') {
                        users[user.number] = 'start'
                    }



                    whatsappGroupReturn = await whatsappGroup(users[user.number], message, userActivityDate[user.number], userActivityStart[user.number], userActivityEnd[user.number])
                    users[user.number] = whatsappGroupReturn.userMenu
                    if (whatsappGroupReturn.userActivityDate != undefined) { userActivityDate[user.number] = whatsappGroupReturn.userActivityDate }
                    if (whatsappGroupReturn.userActivityStart != undefined) { userActivityStart[user.number] = whatsappGroupReturn.userActivityStart }
                    if (whatsappGroupReturn.userActivityEnd != undefined) { userActivityEnd[user.number] = whatsappGroupReturn.userActivityEnd }

                    console.log(users)
                    console.log(userActivityDate)
                    console.log(userActivityStart)
                    console.log(userActivityEnd)
                }
            }
        } else if (!chat.isGroup) {
            await whatsappPrivate(message)
        }

    });

    client.initialize()
}


module.exports = { startWhatsapp };