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

    client.on('message', async(message) => {

        const chat = await message.getChat()

        if (chat.isGroup) {
            const mentions = await message.getMentions();
            let openSessions = 0
            for (const contact of mentions) {
                if (contact.isMe) {
                    openSessions++
                    console.log("Open Group Sessions:" + openSessions)
                    await whatsappGroup(message, client)
                    openSessions--
                    console.log("Open Group Sessions:" + openSessions)

                }
            }
        } else if (!chat.isGroup) {
            await whatsappPrivate(message)
        }

    });

    client.initialize()
}


module.exports = { startWhatsapp };