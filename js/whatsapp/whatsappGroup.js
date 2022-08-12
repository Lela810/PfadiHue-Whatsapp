const { loadAllActivities, createActivity } = require('../db.js')
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
        console.log(await loadAllActivities())
        await chat.sendMessage("test")
        return {
            userMenu: 'start'
        }
    }

    if (userMenu == 2) {
        await chat.sendMessage(await loadAllActivities())
        return {
            userMenu: 2
        }
    }

    if (userMenu == 3) {
        await chat.sendMessage('Setze das Datum für die neue Aktivität. *(Format: 31.07.2003)* ')
        return {
            userMenu: 3.1
        }
    }
    if (userMenu == 3.1) {
        correctDate = moment(messageText, 'DD.MM.YYYY').format('YYYY-MM-DD')
        if (!moment(correctDate).isValid()) {
            await chat.sendMessage('Das Datum wurde nicht korrekt formatiert. *(Format: 31.07.2003)* ')
            return {
                userMenu: 3
            }
        }
        await chat.sendMessage('Setze die *Startzeit* für die Aktivität. *(Format: 13:30)*')
        return {
            userMenu: 3.2,
            userActivityDate: correctDate
        }
    }
    if (userMenu == 3.2) {
        await chat.sendMessage('Setze die *Endzeit* für die Aktivität. *(Format: 16:00)*')
        return {
            userMenu: 3.3,
            userActivityStart: messageText
        }
    }
    if (userMenu == 3.3) {
        await chat.sendMessage('Bitte bestätige die Aktivität mit *Ja* oder *Nein*')
        return {
            userMenu: 3.4,
            userActivityEnd: messageText
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


    return

}




module.exports = { whatsappGroup };