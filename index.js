const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');



const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    if (message.body === '!ping') {
        message.reply('pong');
    }
    if (message.body === '!ping') {
        client.sendMessage(message.from, 'pong');
    }
});

client.initialize();