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

    console.log(messageText)
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
            let counterAbmelden = 1
            for (futureActivity in futureActivities) {
                messageAbmelden += ` *${counterAbmelden})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr\n`
                counterAbmelden++
            }
            messageAbmelden += ` *STOP)* Abbrechen\n`

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
                await chat.sendMessage(`Du hast dich für die Aktivität vom \n - ${moment(futureActivities[messageText - 1].date).format('DD.MM.YYYY')} ${futureActivities[messageText - 1].startzeit} - ${futureActivities[messageText - 1].endzeit} Uhr\n an-/abgemeldet.`)
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
                } catch (err) {
                    messageAlleAbmeldungen = de.whatsappPrivateKeineAbmeldungen
                }
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