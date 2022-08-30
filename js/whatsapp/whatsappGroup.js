const { loadAllActivities, loadAllFutureActivities, createActivity, loadAllRegistrations } = require('../db.js')
const { List } = require('whatsapp-web.js');
const moment = require('moment');
const activity = require('../../models/activity.js');


async function whatsappGroup(userMenu, message, userActivityDate, userActivityStart, userActivityEnd) {

    const chat = await message.getChat()

    let messageText = message.body.replace('@41794706505 ', '')
    if (userMenu == 'start') {
        switch (messageText) {
            case '1':
                userMenu = 1;
                break;
            case '2':
                userMenu = 2;
                break;
            case '3':
                userMenu = 3;
                break;
        }
    }


    if (userMenu == 'start') {
        await chat.sendMessage('Bitte verwende für alle Kommunikation mit mir *<< @Pfadi Hü >>*\n *1)* Zeige alle Aktivitäten\n *2)* Alle Abmeldungen für die Nächste Aktivität\n *3)* Eine neue Aktivität erstellen');
        return {
            userMenu: 'start'
        }
    }

    if (userMenu == 1) {
        const futureActivities = (await loadAllFutureActivities())
        let message = 'Folgende Aktivitäten sind geplant:\n'
        let i = 1
        for (futureActivity in futureActivities) {
            message += ` *${i})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr\n`
            i++
        }
        await chat.sendMessage(message)
        return {
            userMenu: 'start'
        }
    }

    if (userMenu == 2) {

        nextActivity = (await loadAllFutureActivities())[0]
        if (nextActivity == undefined) {
            await chat.sendMessage('Keine Aktivität geplant.')
            return {
                userMenu: 'start'
            }
        }
        const registrations = (await loadAllRegistrations(nextActivity.activityID))
        let message = 'Folgende Abmeldungen:\n'
        let i = 1
        for (registration in registrations) {
            message += ` *${i})* ${(registrations[registration].name)} (${registrations[registration].pushname}) - +${registrations[registration].tel}\n`
            i++
        }
        await chat.sendMessage(message)
        return {
            userMenu: 'start'
        }
    }

    if (userMenu == 3) {
        await chat.sendMessage('Setze das Datum für die neue Aktivität. *(Format: "@Pfadi Hü DD.MM.YYYY")* ')
        return {
            userMenu: 3.1
        }
    }
    if (userMenu == 3.1) {
        correctDate = moment(messageText, 'DD.MM.YYYY').format('YYYY-MM-DD')
        if (!moment(correctDate).isValid() || moment(correctDate).isBefore(moment())) {
            await chat.sendMessage('Das Datum ist nicht korrekt! *(Format: 31.07.2003)* ')
            return {
                userMenu: 3.1
            }
        }
        await chat.sendMessage('Setze die *Startzeit* für die Aktivität. *(Format: 13:30)*')
        return {
            userMenu: 3.2,
            userActivityDate: correctDate
        }
    }
    if (userMenu == 3.2) {

        correctStart = moment(messageText, 'HH:mm').format('HH:mm')
        if (!moment(correctStart, 'HH:mm').isValid()) {
            await chat.sendMessage('Die Startzeit ist nicht korrekt! *(Format: 13:30)* ')
            return {
                userMenu: 3.2
            }
        }

        await chat.sendMessage('Setze die *Endzeit* für die Aktivität. *(Format: 16:00)*')
        return {
            userMenu: 3.3,
            userActivityStart: correctStart
        }
    }
    if (userMenu == 3.3) {

        correctEnd = moment(messageText, 'HH:mm').format('HH:mm')
        if (!moment(correctEnd, 'HH:mm').isValid()) {
            await chat.sendMessage('Die Endzeit ist nicht korrekt! *(Format: 16:00)* ')
            return {
                userMenu: 3.3
            }
        }

        await chat.sendMessage('Bitte bestätige die Aktivität mit *Ja* oder *Nein*')
        return {
            userMenu: 3.4,
            userActivityEnd: correctEnd
        }
    }
    if (userMenu == 3.4) {
        if (messageText.toUpperCase() == 'JA') {
            const finishedActivity = {
                date: userActivityDate,
                startzeit: userActivityStart,
                endzeit: userActivityEnd
            }
            await createActivity(finishedActivity)
            await chat.sendMessage('Die Aktivität wurde erstellt')
        } else if (messageText.toUpperCase() == 'NEIN') {
            await chat.sendMessage('Die Aktivität wurde nicht erstellt')
        } else {
            await chat.sendMessage('Bitte bestätige die Aktivität mit *Ja* oder *Nein*')
            return {
                userMenu: 3.4
            }
        }
        return {
            userMenu: 'start',
            userActivityDate: 0,
            userActivityStart: 0,
            userActivityEnd: 0
        }
    }


    return {
        userMenu: 'start'
    }

}




module.exports = { whatsappGroup };