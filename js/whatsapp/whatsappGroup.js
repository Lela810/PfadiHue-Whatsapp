const { loadAllActivities, loadAllFutureActivities, createActivity, loadAllRegistrations } = require('../db.js')
const { List } = require('whatsapp-web.js');
const moment = require('moment');
const activity = require('../../models/activity.js');
const de = require('../../locales/de.json')


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

    if (messageText.toUpperCase() == 'STOP' || messageText.toUpperCase() == 'STOPP') {
        userMenu = 'start'
    }


    switch (userMenu) {
        case 'start':
            await chat.sendMessage(de.whatsappGroupStart);
            return {
                userMenu: 'start'
            }


        case 1:

            const futureActivities = (await loadAllFutureActivities())
            let messagePlannedActivities = de.whatsappGroupPlannedActivities
            if (futureActivities) {
                let counterPlannedActivities = 1
                for (futureActivity in futureActivities) {
                    messagePlannedActivities += ` *${counterPlannedActivities})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr\n`
                    counterPlannedActivities++
                }
            } else {
                messagePlannedActivities = de.whatsappGroupNoActivities
            }
            await chat.sendMessage(messagePlannedActivities)
            await chat.sendMessage(de.whatsappGroupStart);
            return {
                userMenu: 'start'
            }


        case 2:

            nextActivity = (await loadAllFutureActivities())[0]
            if (nextActivity == undefined) {
                await chat.sendMessage(de.whatsappGroupNoActivities)
                return {
                    userMenu: 'start'
                }
            }
            const registrations = (await loadAllRegistrations(nextActivity.activityID))
            let messageAbmeldungen = de.whatsappGroupAbmeldungen
            if (registrations) {
                for (registration in registrations) {
                    let counterAbmeldungen = 1
                    messageAbmeldungen += ` *${counterAbmeldungen})* ${(registrations[registration].name)} (${registrations[registration].pushname}) - +${registrations[registration].tel}\n`
                    counterAbmeldungen++
                }
            } else {
                messageAbmeldungen = de.whatsappGroupKeineAbmeldungen
            }
            await chat.sendMessage(messageAbmeldungen)
            await chat.sendMessage(de.whatsappGroupStart);
            return {
                userMenu: 'start'
            }


        case 3:

            await chat.sendMessage(de.whatsappGroupCreateActivityDate)
            return {
                userMenu: 3.1
            }


        case 3.1:

            correctDate = moment(messageText, 'DD.MM.YYYY').format('YYYY-MM-DD')
            if (!moment(correctDate).isValid() || moment(correctDate).isBefore(moment())) {
                await chat.sendMessage(de.whatsappGroupCreateActivityDateIncorrect)
                return {
                    userMenu: 3.1
                }
            }
            await chat.sendMessage(de.whatsappGroupCreateActivityTime)
            return {
                userMenu: 3.2,
                userActivityDate: correctDate
            }


        case 3.2:

            correctStart = moment(messageText, 'HH:mm').format('HH:mm')
            if (!moment(correctStart, 'HH:mm').isValid()) {
                await chat.sendMessage(de.whatsappGroupCreateActivityTimeIncorrect)
                return {
                    userMenu: 3.2
                }
            }

            await chat.sendMessage(de.whatsappGroupCreateActivityEndtime)
            return {
                userMenu: 3.3,
                userActivityStart: correctStart
            }


        case 3.3:

            correctEnd = moment(messageText, 'HH:mm').format('HH:mm')
            if (!moment(correctEnd, 'HH:mm').isValid()) {
                await chat.sendMessage(de.whatsappGroupCreateActivityEndtimeIncorrect)
                return {
                    userMenu: 3.3
                }
            }

            await chat.sendMessage(de.whatsappGroupCreateActivityConfirm)
            return {
                userMenu: 3.4,
                userActivityEnd: correctEnd
            }


        case 3.4:

            if (messageText.toUpperCase() == 'JA') {
                const finishedActivity = {
                    date: userActivityDate,
                    startzeit: userActivityStart,
                    endzeit: userActivityEnd
                }
                await createActivity(finishedActivity)
                await chat.sendMessage(de.whatsappGroupCreateActivityConfirmYes)
            } else if (messageText.toUpperCase() == 'NEIN') {
                await chat.sendMessage(de.whatsappGroupCreateActivityConfirmNo)
            } else {
                await chat.sendMessage(de.whatsappGroupCreateActivityConfirm)
                return {
                    userMenu: 3.4
                }
            }
            await chat.sendMessage(de.whatsappGroupStart);
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