const { loadAllFutureActivities, createActivity, loadAllRegistrations, getTeilnehmer } = require('../db.js')
const moment = require('moment');
const de = require('../../locales/de.json');


async function parseRegistrations(futureActivitiesChoice) {
    const registrations = (await loadAllRegistrations(futureActivitiesChoice.activityID))
    let messageAbmeldungen =
        "*Aktivität vom " +
        moment(futureActivitiesChoice.date).format('DD.MM.YYYY') +
        "* \n" +
        de.whatsappGroupAbmeldungen

    if (Object.keys(registrations) > 0) {
        for (registration in registrations) {
            const teilnehmer = await getTeilnehmer(registrations[registration].tel)
            let counterAbmeldungen = 1
            messageAbmeldungen += ` *${counterAbmeldungen})* ${teilnehmer.scoutname} (${teilnehmer.pushname}) - +${teilnehmer.telephone}\n`
            counterAbmeldungen++
        }
    } else {
        messageAbmeldungen = de.whatsappGroupKeineAbmeldungen
    }
    return messageAbmeldungen;
}



async function whatsappGroup(userMenu, message, activityDate, activityStart, activityEnd, lastMessage) {

    const chat = await message.getChat()

    let messageText = message.body
        .replace('@41794706505 ', '')
        .trim()
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

            const futureActivitiesMeldungen = (await loadAllFutureActivities())
            let messageMeldungen = de.whatsappGroupChooseActivity
            if (futureActivitiesMeldungen) {
                let counterPlannedActivities = 1
                for (futureActivity in futureActivitiesMeldungen) {
                    messageMeldungen += ` *${counterPlannedActivities})* ${moment(futureActivitiesMeldungen[futureActivity].date).format('DD.MM.YYYY')} ${futureActivitiesMeldungen[futureActivity].startzeit} - ${futureActivitiesMeldungen[futureActivity].endzeit} Uhr\n`
                    counterPlannedActivities++
                }
            } else {
                messageMeldungen = de.whatsappGroupNoActivities
                await chat.sendMessage(messageMeldungen)
                await chat.sendMessage(de.whatsappGroupStart);
                return {
                    userMenu: 'start'
                }
            }
            if (futureActivitiesMeldungen.length < 2) {
                await chat.sendMessage(await parseRegistrations(futureActivitiesMeldungen[0]))
                await chat.sendMessage(de.whatsappGroupStart);
                return {
                    userMenu: 'start'
                }
            }
            messageMeldungen += de.whatsappGlobalStop
            await chat.sendMessage(messageMeldungen)
            return {
                userMenu: 2.1,
                lastMessage: messageMeldungen
            }


        case 2.1:

            let futureActivitiesChoice = await loadAllFutureActivities()

            if (isNaN(messageText) || messageText < 1 || messageText > futureActivitiesChoice.length) {
                await chat.sendMessage(lastMessage)
                return {
                    userMenu: 2.1
                }
            }

            futureActivitiesChoice = futureActivitiesChoice[messageText - 1]
            await chat.sendMessage(await parseRegistrations(futureActivitiesChoice))
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
                activityDate: correctDate
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
                activityStart: correctStart
            }


        case 3.3:

            correctEnd = moment(messageText, 'HH:mm').format('HH:mm')
            if (!moment(correctEnd, 'HH:mm').isValid() || moment(correctEnd, 'HH:mm').isBefore(moment(activityStart, 'HH:mm'))) {
                await chat.sendMessage(de.whatsappGroupCreateActivityEndtimeIncorrect)
                return {
                    userMenu: 3.3
                }
            }

            await chat.sendMessage(
                de.whatsappGroupCreateActivitydoublecheck
                .replace('{date}', moment(activityDate).format('DD.MM.YYYY'))
                .replace('{start}', activityStart)
                .replace('{end}', correctEnd)
            )
            await chat.sendMessage(de.whatsappGroupCreateActivityConfirm)
            return {
                userMenu: 3.4,
                activityEnd: correctEnd
            }


        case 3.4:

            if (messageText.toUpperCase() == 'JA') {
                const finishedActivity = {
                    date: activityDate,
                    startzeit: activityStart,
                    endzeit: activityEnd
                }
                await createActivity(finishedActivity)
                await chat.sendMessage(de.whatsappGroupCreateActivityConfirmYes)
            } else if (messageText.toUpperCase() == 'NEIN') {
                await chat.sendMessage(de.whatsappGroupCreateActivityConfirmNo)
            } else {
                await chat.sendMessage(
                    de.whatsappGroupCreateActivitydoublecheck
                    .replace('{date}', moment(activityDate).format('DD.MM.YYYY'))
                    .replace('{start}', activityStart)
                    .replace('{end}', activityEnd)
                )
                await chat.sendMessage(de.whatsappGroupCreateActivityConfirm)
                return {
                    userMenu: 3.4
                }
            }
            await chat.sendMessage(de.whatsappGroupStart);
            return {
                userMenu: 'start',
                activityDate: 0,
                activityStart: 0,
                activityEnd: 0
            }
    }


    return {
        userMenu: 'start'
    }

}




module.exports = { whatsappGroup };