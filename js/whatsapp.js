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

    let usersObject = new Object();
    let usersPrivateObject = new Object();

    client.on('message', async(message) => {

        const chat = await message.getChat()
        const user = await message.getContact()

        if (chat.isGroup) {

            if (!usersObject[user.number]) {
                usersObject[user.number] = new Object()
                usersObject[user.number].userMenu = 'start'
            } else if (usersObject[user.number].userMenu == 'undefined') {
                usersObject[user.number].userMenu = 'start'
            }

            const mentions = await message.getMentions();
            for (const contact of mentions) {
                if (contact.isMe) {

                    const whatsappGroupReturn = await whatsappGroup(
                        usersObject[user.number].userMenu,
                        message,
                        usersObject[user.number].activityDate,
                        usersObject[user.number].activityStart,
                        usersObject[user.number].activityEnd
                    )


                    let changed = false


                    for (const object in whatsappGroupReturn) {
                        if (whatsappGroupReturn[object] != undefined) {
                            usersObject[user.number][object] = whatsappGroupReturn[object]
                            changed = true
                        }
                    }

                    if (whatsappGroupReturn.userMenu != 'start') { changed = true }

                    if (changed) {
                        usersObject[user.number].timestamp = new Date().getTime()
                        usersObject[user.number].message = message
                    }

                }
            }
        } else if (!chat.isGroup) {

            if (!usersPrivateObject[user.number]) {
                usersPrivateObject[user.number] = new Object()
                usersPrivateObject[user.number].userMenu = 'start'
            } else if (usersPrivateObject[user.number].userMenu == 'undefined') {
                usersPrivateObject[user.number].userMenu = 'start'
            }

            if (!usersPrivateObject[user.number].registered) {
                if (await checkTeilnehmer(user.number)) {
                    usersPrivateObject[user.number].registered = true
                } else {

                    const chat = await message.getChat()
                    let messageText = message.body

                    if (usersPrivateObject[user.number].userMenu == 'registration') {

                        if (messageText.toUpperCase() == 'JA') {
                            await chat.sendMessage(
                                de.whatsappPrivateRegisterConfirmYes
                                .replace('{pfadinamen}', usersPrivateObject[user.number].scoutname)
                            )
                            await chat.sendMessage(de.whatsappPrivateStart);
                            usersPrivateObject[user.number].registered = true
                            usersPrivateObject[user.number].userMenu = 'start'
                            const jsonTeilnehmer = {
                                telephone: user.number,
                                scoutname: usersPrivateObject[user.number].scoutname,
                                pushname: user.pushname
                            }
                            await createTeilnehmer(jsonTeilnehmer)

                        } else if (messageText.toUpperCase() == 'NEIN') {
                            await chat.sendMessage(de.whatsappPrivateRegister)
                            usersPrivateObject[user.number].userMenu = 'registrationConfirm'
                        } else {
                            await chat.sendMessage(
                                de.whatsappPrivateRegisterConfirm
                                .replace('{pfadinamen}', usersPrivateObject[user.number].scoutname)
                            )
                            usersPrivateObject[user.number].userMenu = 'registration'
                        }

                    } else if (usersPrivateObject[user.number].userMenu == 'registrationConfirm') {
                        if (onlyLetters(messageText) && messageText.length <= 15) {
                            await chat.sendMessage(
                                de.whatsappPrivateRegisterConfirm
                                .replace('{pfadinamen}', capitalizeFirstLetter(messageText))
                            )
                            usersPrivateObject[user.number].scoutname = capitalizeFirstLetter(messageText)
                            usersPrivateObject[user.number].userMenu = 'registration'
                        } else {
                            await chat.sendMessage(de.whatsappPrivateRegisterIncorrect);
                            usersPrivateObject[user.number].userMenu = 'registrationConfirm'
                        }

                    } else {
                        await chat.sendMessage(de.whatsappPrivateRegister);
                        usersPrivateObject[user.number].userMenu = 'registrationConfirm'
                    }

                }
            } else {
                const whatsappPrivateReturn = await whatsappPrivate(
                    usersPrivateObject[user.number].userMenu,
                    message, usersPrivateObject[user.number].futureActivities
                )

                let changed = false

                for (const object in whatsappPrivateReturn) {
                    if (whatsappPrivateReturn[object] != undefined) {
                        usersPrivateObject[user.number][object] = whatsappPrivateReturn[object]
                        changed = true
                    }
                }


                if (whatsappPrivateReturn.userMenuPrivate != 'start') { changed = true }

                if (changed) {
                    usersPrivateObject[user.number].timestamp = new Date().getTime()
                    usersPrivateObject[user.number].message = message
                }
            }
        }

    });

    setInterval(resetProgress, 10000);

    async function resetProgress() {
        for (userForTimestamp in usersPrivateObject) {
            if (usersPrivateObject[userForTimestamp].userMenu == 'start') { delete usersPrivateObject[userForTimestamp].timestamp }
            if (new Date().getTime() - usersPrivateObject[userForTimestamp].timestamp > 300000) {
                delete usersPrivateObject[userForTimestamp]
            }
        }
        for (userForTimestamp in usersObject) {
            if (usersObject[userForTimestamp].userMenu == 'start') { delete usersObject[userForTimestamp].timestamp }
            if (new Date().getTime() - usersObject[userForTimestamp].timestamp > 300000) {
                const chat = await usersObject[userForTimestamp].message.getChat()
                await chat.sendMessage(de.whatsappPrivateStart);

                delete usersObject[userForTimestamp]
            }
        }
    }

    client.initialize()
}


module.exports = { startWhatsapp };