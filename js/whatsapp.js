const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { sendQrMail } = require('./mail.js');
const QRCode = require('easyqrcodejs-nodejs');
const { whatsappGroup } = require('./whatsapp/whatsappGroup.js');
const { whatsappPrivate } = require('./whatsapp/whatsappPrivate.js');
const de = require('../locales/de.json');
const { checkTeilnehmer, createTeilnehmer } = require('./db.js');



function onlyLetters(str) {
    return /^[a-zA-Z]+$/.test(str);
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


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
    let usersTimestamp = new Object();
    let usersMessage = new Object();
    let usersPrivate = new Object();
    let usersPrivateRegistered = new Object();
    let usersPrivateName = new Object();
    let usersPrivateTimestamp = new Object();
    let usersPrivateMessage = new Object();
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
                    let changed = false
                    if (whatsappGroupReturn.userActivityDate != undefined) {
                        userActivityDate[user.number] = whatsappGroupReturn.userActivityDate;
                        changed = true
                    }
                    if (whatsappGroupReturn.userActivityStart != undefined) {
                        userActivityStart[user.number] = whatsappGroupReturn.userActivityStart;
                        changed = true
                    }
                    if (whatsappGroupReturn.userActivityEnd != undefined) {
                        userActivityEnd[user.number] = whatsappGroupReturn.userActivityEnd;
                        changed = true
                    }
                    if (whatsappGroupReturn.userMenu != 'start') { changed = true }
                    if (changed) {
                        usersTimestamp[user.number] = new Date().getTime()
                        usersMessage[user.number] = message
                    }

                }
            }
        } else if (!chat.isGroup) {

            if (!usersPrivateRegistered[user.number]) {
                if (await checkTeilnehmer(user.number)) {
                    usersPrivateRegistered[user.number] = true
                } else {

                    const chat = await message.getChat()
                    let messageText = message.body

                    if (usersPrivate[user.number] == 'registration') {

                        if (messageText.toUpperCase() == 'JA') {
                            await chat.sendMessage(
                                de.whatsappPrivateRegisterConfirmYes
                                .replace('{pfadinamen}', usersPrivateName[user.number])
                            )
                            await chat.sendMessage(de.whatsappPrivateStart);
                            usersPrivateRegistered[user.number] = true
                            usersPrivate[user.number] = 'start'
                            const jsonTeilnehmer = {
                                telephone: user.number,
                                scoutname: usersPrivateName[user.number],
                                pushname: user.pushname
                            }
                            await createTeilnehmer(jsonTeilnehmer)

                        } else if (messageText.toUpperCase() == 'NEIN') {
                            await chat.sendMessage(de.whatsappPrivateRegister)
                            usersPrivate[user.number] = 'registrationConfirm'
                        } else {
                            await chat.sendMessage(
                                de.whatsappPrivateRegisterConfirm
                                .replace('{pfadinamen}', usersPrivateName[user.number])
                            )
                            usersPrivate[user.number] = 'registration'
                        }

                    } else if (usersPrivate[user.number] == 'registrationConfirm') {
                        if (onlyLetters(messageText)) {
                            await chat.sendMessage(
                                de.whatsappPrivateRegisterConfirm
                                .replace('{pfadinamen}', capitalizeFirstLetter(messageText))
                            )
                            usersPrivateName[user.number] = capitalizeFirstLetter(messageText)
                            usersPrivate[user.number] = 'registration'
                        } else {
                            await chat.sendMessage(de.whatsappPrivateRegisterIncorrect);
                            usersPrivate[user.number] = 'registrationConfirm'
                        }

                    } else {
                        await chat.sendMessage(de.whatsappPrivateRegister);
                        usersPrivate[user.number] = 'registrationConfirm'
                    }

                }
            } else {
                whatsappGroupReturnPrivate = await whatsappPrivate(usersPrivate[user.number], message, futureActivities[user.number])
                usersPrivate[user.number] = whatsappGroupReturnPrivate.userMenuPrivate
                let changed = false
                if (whatsappGroupReturnPrivate.futureActivities != undefined) {
                    futureActivities[user.number] = whatsappGroupReturnPrivate.futureActivities;
                    changed = true
                }
                if (whatsappGroupReturnPrivate.userMenuPrivate != 'start') { changed = true }
                if (changed) {
                    usersPrivateTimestamp[user.number] = new Date().getTime()
                    usersPrivateMessage[user.number] = message
                }
            }
        }

    });

    setInterval(resetProgress, 10000);

    async function resetProgress() {
        for (userNumber in usersTimestamp) {
            if (users[userNumber] == 'start') { delete usersTimestamp[userNumber] }
            if (new Date().getTime() - usersTimestamp[userNumber] > 300000) {
                delete usersTimestamp[userNumber]
                users[userNumber] = 'start'
                userActivityDate[userNumber] = 0
                userActivityStart[userNumber] = 0
                userActivityEnd[userNumber] = 0

                const chat = await usersMessage[userNumber].getChat()
                await chat.sendMessage(de.whatsappGroupStart);
            }
        }
        for (userNumber in usersPrivateTimestamp) {
            if (usersPrivate[userNumber] == 'start') { delete usersPrivateTimestamp[userNumber] }
            if (new Date().getTime() - usersPrivateTimestamp[userNumber] > 300000) {
                delete usersPrivateTimestamp[userNumber]
                usersPrivate[userNumber] = 'start'
                futureActivities[userNumber] = 0

                const chat = await usersPrivateMessage[userNumber].getChat()
                await chat.sendMessage(de.whatsappPrivateStart);
            }
        }
    }

    client.initialize()
}


module.exports = { startWhatsapp };