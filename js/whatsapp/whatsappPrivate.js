const { loadAllFutureActivities, registerForActivity } = require('../db.js')
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
                let abgemeldet = ''
                for (futureActivity in futureActivities) {
                    try { if (futureActivities[futureActivity].meldungen[user.number]) { abgemeldet = '> *Abgemeldet* ' } } catch {}
                    messageAbmelden += `*${counterAbmelden})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr ${abgemeldet}\n`
                    counterAbmelden++
                }
                messageAbmelden += `*STOP)* Abbrechen\n`
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
                Number(messageText)
            } catch (err) {
                await chat.sendMessage(de.whatsappPrivateChooseActivity)
                return {
                    userMenuPrivate: 1.1
                }
            }
            if (messageText <= futureActivities.length) {
                await chat.sendMessage(`Du hast dich für die Aktivität vom \n - ${moment(futureActivities[Math.abs(messageText) - 1].date).format('DD.MM.YYYY')} ${futureActivities[Math.abs(messageText) - 1].startzeit} - ${futureActivities[Math.abs(messageText) - 1].endzeit} Uhr\n abgemeldet.`)
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