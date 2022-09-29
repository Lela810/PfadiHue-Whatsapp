const { loadAllFutureActivities, loadAllRegistrations, remindedForActivity, getAllTeilnehmer } = require('../db.js')
const moment = require('moment');
const de = require('../../locales/de.json');

function includesInObject(objects, value) {
    for (object in objects) {
        if (Object.values(Object.values(objects[object]).includes(value.toString()))) {
            return true
        } else {
            return false
        }
    }
}



async function remindEveryone(client) {

    const futureActivities = await loadAllFutureActivities()
    for (activity in futureActivities) {
        if (moment(futureActivities[activity].startzeit, 'HH:mm').subtract(2, 'hour').format('HH:mm') <= moment().format('HH:mm') &&
            !(moment(futureActivities[activity].startzeit, 'HH:mm').format('HH:mm') <= moment().format('HH:mm')) &&
            moment().isSame(futureActivities[activity].date, 'day') &&
            !futureActivities[activity].reminded) {


            const alleTeilnehmer = await getAllTeilnehmer()
            const registrations = (await loadAllRegistrations(futureActivities[activity].activityID))

            for (teilnehmer in alleTeilnehmer) {
                if (!includesInObject(registrations, alleTeilnehmer[teilnehmer].telephone)) {

                    const chat = await client.getChatById(alleTeilnehmer[teilnehmer].chatid._serialized)
                    setTimeout(async() => {
                        await chat.sendMessage(de.whatsappPrivateReminder
                            .replace('{start}', futureActivities[activity].startzeit))
                    }, 2000)
                }
            }

            remindedForActivity(futureActivities[activity].activityID)

        }
    }

}




module.exports = { remindEveryone };