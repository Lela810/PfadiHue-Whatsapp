const { loadAllFutureActivities, registerForActivity, unregisterForActivity } = require('../db.js')
const moment = require('moment')
const de = require('../../locales/de.json')


async function whatsappPrivate(userMenuPrivate, message, futureActivities) {

    const chat = await message.getChat()
    const user = await message.getContact()

    let messageText = message.body
    if (userMenuPrivate == 'start') {
        switch (messageText) {
            case '1':
                userMenuPrivate = 1;
                break;
            case '2':
                userMenuPrivate = 2;
                break;
            case '3':
                userMenuPrivate = 3;
                break;
        }
    }


    if (messageText.toUpperCase() == 'STOP' || messageText.toUpperCase() == 'STOPP') {
        userMenuPrivate = 'start'
    }


    switch (userMenuPrivate) {
        case 'start':
            await chat.sendMessage(de.whatsappPrivateStart);
            return {
                userMenuPrivate: 'start'
            }

        case 1:

            futureActivities = (await loadAllFutureActivities())
            let messageAbmelden = de.whatsappPrivateAbmelden

            if (futureActivities) {
                let counterAbmelden = 1
                let counterAbgemeldet = 1
                let prefix = ''
                for (futureActivity in futureActivities) {
                    try {
                        if (futureActivities[futureActivity].meldungen[user.number]) {
                            prefix = de.whatsappPrivateAbgemeldet;
                            counterAbgemeldet++
                        } else {
                            prefix = counterAbmelden
                        }
                    } catch { prefix = counterAbmelden }
                    messageAbmelden += `*${prefix})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr\n`
                    counterAbmelden++
                }
                if (counterAbgemeldet == counterAbmelden) {
                    messageAbmelden += de.whatsappPrivateAlleAbgemeldet
                    await chat.sendMessage(messageAbmelden)
                    await chat.sendMessage(de.whatsappPrivateStart);
                    return {
                        userMenuPrivate: 'start'
                    }
                } else {
                    messageAbmelden += de.whatsappGlobalStop
                }
            } else {
                await chat.sendMessage(de.whatsappPrivateKeineAktivitaeten)
                await chat.sendMessage(de.whatsappPrivateStart);
                return {
                    userMenuPrivate: 'start'
                }
            }


            await chat.sendMessage(messageAbmelden)

            return {
                userMenuPrivate: 1.1,
                futureActivities: futureActivities
            }


        case 1.1:

            try {
                messageText = Math.abs(Number(messageText))
            } catch (err) {
                await chat.sendMessage(de.whatsappPrivateChooseActivity)
                return {
                    userMenuPrivate: 1.1
                }
            }
            if (messageText <= futureActivities.length) {
                await chat.sendMessage(`Du hast dich für die Aktivität vom \n - ${moment(futureActivities[messageText - 1].date).format('DD.MM.YYYY')} ${futureActivities[messageText - 1].startzeit} - ${futureActivities[messageText - 1].endzeit} Uhr\n abgemeldet.`)
                const meldung = {
                    name: user.name,
                    pushname: user.pushname,
                    tel: user.number,
                    timestamp: moment().format(),
                }
                registerForActivity(futureActivities[messageText - 1].activityID, meldung)
                await chat.sendMessage(de.whatsappPrivateStart);
                return {
                    userMenuPrivate: 'start',
                    futureActivities: 0
                }
            } else {
                await chat.sendMessage(de.whatsappPrivateChooseActivity)
                return {
                    userMenuPrivate: 1.1
                }
            }


        case 2:

            futureActivities = (await loadAllFutureActivities())
            let messageAnmelden = de.whatsappPrivateAbmeldungLoeschen
            let counterAnmelden = 1
            for (futureActivity in futureActivities) {
                try {
                    if (futureActivities[futureActivity].meldungen[user.number]) {
                        messageAnmelden += ` *${counterAnmelden})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr\n`
                        counterAnmelden++
                    }
                } catch {}
            }
            if (counterAnmelden == 1) {
                messageAnmelden = de.whatsappPrivateKeineAbmeldungen
                await chat.sendMessage(messageAnmelden)
                await chat.sendMessage(de.whatsappPrivateStart);
                return {
                    userMenuPrivate: 'start'
                }
            }

            messageAnmelden += de.whatsappGlobalStop
            await chat.sendMessage(messageAnmelden)

            return {
                userMenuPrivate: 2.1,
                futureActivities: futureActivities
            }


        case 2.1:

            try {
                messageText = Math.abs(Number(messageText))
            } catch (err) {
                await chat.sendMessage(de.whatsappPrivateChooseActivity)
                return {
                    userMenuPrivate: 2.1
                }
            }
            if (messageText <= futureActivities.length) {
                await chat.sendMessage(`Du hast dich für die Aktivität vom \n - ${moment(futureActivities[messageText - 1].date).format('DD.MM.YYYY')} ${futureActivities[messageText - 1].startzeit} - ${futureActivities[messageText - 1].endzeit} Uhr\n angemeldet 🥳`)

                unregisterForActivity(futureActivities[messageText - 1].activityID, user.number)
                await chat.sendMessage(de.whatsappPrivateStart);
                return {
                    userMenuPrivate: 'start',
                    futureActivities: 0
                }
            } else {
                await chat.sendMessage(de.whatsappPrivateChooseActivity)
                return {
                    userMenuPrivate: 2.1
                }
            }


        case 3:

            futureActivities = (await loadAllFutureActivities())
            let messageAlleAbmeldungen = de.whatsappPrivateAlleAbmeldungen
            let counterAlleAbmeldungen = 1
            for (futureActivity in futureActivities) {
                try {
                    if (futureActivities[futureActivity].meldungen[user.number]) {
                        messageAlleAbmeldungen += ` *${counterAlleAbmeldungen})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr\n`
                        counterAlleAbmeldungen++
                    }
                } catch {}
            }
            if (counterAlleAbmeldungen == 1) {
                messageAlleAbmeldungen = de.whatsappPrivateKeineAbmeldungen
            }

            await chat.sendMessage(messageAlleAbmeldungen)
            await chat.sendMessage(de.whatsappPrivateStart);
            return {
                userMenuPrivate: 'start'
            }

    }

    return {
        userMenu: 'start'
    }

}



module.exports = { whatsappPrivate };