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
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
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
        client.sendPresenceAvailable()
    });

    let users = new Object();
    let usersPrivate = new Object();
    let userActivityDate = new Object()
    let userActivityStart = new Object()
    let userActivityEnd = new Object()
    let futureActivities = new Object()
    let whatsappGroupReturn
    let whatsappGroupReturnPrivate

    client.on('message', async(message) => {

        const chat = await message.getChat()
        const user = await message.getContact()

        if (!users[user.number] || users[user.number] == 'undefined') {
            users[user.number] = 'start'
            usersPrivate[user.number] = 'start'
        }


        if (chat.isGroup) {
            const mentions = await message.getMentions();
            for (const contact of mentions) {
                if (contact.isMe) {

                    whatsappGroupReturn = await whatsappGroup(users[user.number], message, userActivityDate[user.number], userActivityStart[user.number], userActivityEnd[user.number])
                    users[user.number] = whatsappGroupReturn.userMenu
                    if (whatsappGroupReturn.userActivityDate != undefined) { userActivityDate[user.number] = whatsappGroupReturn.userActivityDate }
                    if (whatsappGroupReturn.userActivityStart != undefined) { userActivityStart[user.number] = whatsappGroupReturn.userActivityStart }
                    if (whatsappGroupReturn.userActivityEnd != undefined) { userActivityEnd[user.number] = whatsappGroupReturn.userActivityEnd }

                }
            }
        } else if (!chat.isGroup) {
            whatsappGroupReturnPrivate = await whatsappPrivate(usersPrivate[user.number], message, futureActivities[user.number])
            usersPrivate[user.number] = whatsappGroupReturnPrivate.userMenuPrivate
            if (whatsappGroupReturnPrivate.futureActivities != undefined) { futureActivities[user.number] = whatsappGroupReturnPrivate.futureActivities }
        }

    });

    client.initialize()
}


module.exports = { startWhatsapp };