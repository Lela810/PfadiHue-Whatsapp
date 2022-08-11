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

    let users = {}

    client.on('message', async(message) => {

        const chat = await message.getChat()



        if (chat.isGroup) {
            const mentions = await message.getMentions();
            for (const contact of mentions) {
                if (contact.isMe) {
                    const user = await message.getContact()
                    if (!users[user.number]) {
                        users[user.number] = 'start'
                    }

                    console.log(users)

                    users[user.number] = await whatsappGroup(users[user.number], message)
                }
            }
        } else if (!chat.isGroup) {
            await whatsappPrivate(message)
        }

    });

    client.initialize()
}


module.exports = { startWhatsapp };