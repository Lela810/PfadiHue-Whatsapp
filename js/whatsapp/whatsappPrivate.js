const { loadAllFutureActivitiesTN, registerForActivity, unregisterForActivity } = require('../db.js')
const moment = require('moment')
const de = require('../../locales/de.json')




async function whatsappPrivate(userMenu, message, futureActivities, lastMessage) {

    const chat = await message.getChat()
    const user = await message.getContact()

    let messageText = message.body.trim()
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
            await chat.sendMessage(de.whatsappPrivateStart);
            return {
                userMenu: 'start'
            }

        case 1:

            futureActivities = (await loadAllFutureActivitiesTN())
            let messageAbmelden = de.whatsappPrivateAbmelden

            if (futureActivities.length > 0) {
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
                        userMenu: 'start'
                    }
                } else {
                    messageAbmelden += de.whatsappGlobalStop
                }
            } else {
                await chat.sendMessage(de.whatsappPrivateKeineAktivitaeten)
                await chat.sendMessage(de.whatsappPrivateStart);
                return {
                    userMenu: 'start'
                }
            }


            await chat.sendMessage(messageAbmelden)

            return {
                userMenu: 1.1,
                futureActivities: futureActivities,
                lastMessage: messageAbmelden
            }


        case 1.1:

            if (isNaN(messageText) || messageText < 1 || messageText > futureActivities.length) {
                await chat.sendMessage(lastMessage)
                return {
                    userMenu: 1.1
                }
            } else if (futureActivities[messageText - 1].meldungen) {
                if (futureActivities[messageText - 1].meldungen[user.number]) {
                    await chat.sendMessage(de.whatsappPrivateBereitsAbgemeldet)
                    await chat.sendMessage(lastMessage)
                    return {
                        userMenu: 1.1
                    }
                }
            }


            await chat.sendMessage(`Du hast dich für die Aktivität vom \n - ${moment(futureActivities[messageText - 1].date).format('DD.MM.YYYY')} ${futureActivities[messageText - 1].startzeit} - ${futureActivities[messageText - 1].endzeit} Uhr\n abgemeldet.`)
            const meldung = {
                timestamp: moment().format(),
                tel: user.number
            }
            registerForActivity(futureActivities[messageText - 1].activityID, meldung, user.number)
            await chat.sendMessage(de.whatsappPrivateStart);
            return {
                userMenu: 'start',
                futureActivities: 0
            }



        case 2:

            futureActivities = (await loadAllFutureActivitiesTN())
            let messageAnmelden = de.whatsappPrivateAbmeldungLoeschen
            let counterAnmelden = 1
            let futureActivitiesNew = new Array()
            for (futureActivity in futureActivities) {
                try {
                    if (futureActivities[futureActivity].meldungen[user.number]) {
                        messageAnmelden += ` *${counterAnmelden})* ${moment(futureActivities[futureActivity].date).format('DD.MM.YYYY')} ${futureActivities[futureActivity].startzeit} - ${futureActivities[futureActivity].endzeit} Uhr\n`
                        futureActivitiesNew.push(futureActivities[futureActivity])
                        counterAnmelden++
                    }
                } catch {}
            }
            if (counterAnmelden == 1) {
                messageAnmelden = de.whatsappPrivateKeineAbmeldungen
                await chat.sendMessage(messageAnmelden)
                await chat.sendMessage(de.whatsappPrivateStart);
                return {
                    userMenu: 'start'
                }
            }


            messageAnmelden += de.whatsappGlobalStop
            await chat.sendMessage(messageAnmelden)

            return {
                userMenu: 2.1,
                futureActivities: futureActivitiesNew,
                lastMessage: messageAnmelden
            }


        case 2.1:

            if (isNaN(messageText) || messageText < 1 || messageText > futureActivities.length) {
                await chat.sendMessage(lastMessage)
                return {
                    userMenu: 2.1
                }
            }

            await chat.sendMessage(`Du hast dich für die Aktivität vom \n - ${moment(futureActivities[messageText - 1].date).format('DD.MM.YYYY')} ${futureActivities[messageText - 1].startzeit} - ${futureActivities[messageText - 1].endzeit} Uhr\n angemeldet 🥳`)

            unregisterForActivity(futureActivities[messageText - 1].activityID, user.number)
            await chat.sendMessage(de.whatsappPrivateStart);
            return {
                userMenu: 'start',
                futureActivities: 0
            }



        case 3:

            futureActivities = (await loadAllFutureActivitiesTN())
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
                userMenu: 'start'
            }

    }

    return {
        userMenu: 'start'
    }

}



module.exports = { whatsappPrivate };