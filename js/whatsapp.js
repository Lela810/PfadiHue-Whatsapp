const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { sendQrMail } = require('./mail.js');
const QRCode = require('easyqrcodejs-nodejs');

async function startWhatsapp() {
    let client
    if (process.env.PROD == 'true') {
        client = new Client({
            authStrategy: new LocalAuth()
        });
    } else {
        client = new Client();
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
        const mentions = await message.getMentions();
        const chat = await message.getChat()

        for (const contact of mentions) {
            if (contact.isMe) {
                chat.sendMessage('Test2');
            }
        }

    });

    client.initialize()
}


module.exports = { startWhatsapp };