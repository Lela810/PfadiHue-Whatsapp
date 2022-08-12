const { loadAllFutureActivities, registerForActivity } = require('../db.js')
const moment = require('moment')


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


    if (userMenuPrivate == 'start') {
        await chat.sendMessage('Hier kannst du mit mir interagieren.\nAntworte lediglich mit der passenden Nummer ⚜️ \n*1)* Für die nächste Aktivität An-/Abmelden\n*2)* Zeige alle An-/Abmeldungen');
        return {
            userMenuPrivate: 'start'
        }
    }
    if (userMenuPrivate == 1) {

        futureActivities = (await loadAllFutureActivities())
        let message = 'Bitte wähle eine Aktivität aus:\n'
        let i = 1
        for (futureActivity in futureActivities) {
            message += ` *${i})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr\n`
            i++
        }

        await chat.sendMessage(message)

        return {
            userMenuPrivate: 1.1,
            futureActivities: futureActivities
        }
    }
    if (userMenuPrivate == 1.1) {
        try {
            Number(messageText)
        } catch (err) {
            await chat.sendMessage('Bitte wähle eine Aktivität aus.')
            return {
                userMenuPrivate: 1.1
            }
        }
        if (messageText <= futureActivities.length + 1) {
            await chat.sendMessage(`Du hast dich für die Aktivität vom \n - ${moment(futureActivities[messageText - 1].date).format('DD.MM.YYYY')} ${futureActivities[messageText - 1].startzeit} - ${futureActivities[messageText - 1].endzeit} Uhr\n an-/abgemeldet.`)
            const meldung = {
                name: user.name,
                pushname: user.pushname,
                tel: user.number,
                timestamp: moment().format(),
            }
            registerForActivity(futureActivities[messageText - 1].activityID, meldung)
            return {
                userMenuPrivate: 'start',
                futureActivities: 0
            }
        } else {
            await chat.sendMessage('Bitte wähle eine Aktivität aus.')
            return {
                userMenuPrivate: 1.1
            }
        }

    }

    return {
        userMenu: 'start'
    }

}



module.exports = { whatsappPrivate };