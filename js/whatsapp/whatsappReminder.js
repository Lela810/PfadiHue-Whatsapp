const { loadAllFutureActivities, loadAllRegistrations, remindedForActivity, getAllTeilnehmer } = require('../db.js')
const moment = require('moment');

async function remindEveryone() {
    const futureActivities = await loadAllFutureActivities()
    for (activity in futureActivities) {
        if (moment(futureActivities[activity].startzeit, 'HH:mm').subtract(2, 'hour').format('HH:mm') <= moment().format('HH:mm') &&
            moment().isSame(futureActivities[activity].date, 'day') &&
            !futureActivities[activity].reminded) {


            const alleTeilnehmer = await getAllTeilnehmer()
            const registrations = (await loadAllRegistrations(futureActivities[activity].activityID))
            console.log(Object.keys(registrations))
            for (teilnehmer in alleTeilnehmer) {

                if (!registrations.includes(alleTeilnehmer[teilnehmer].telephone)) {
                    console.log(`Send reminder to ${alleTeilnehmer[teilnehmer].telephone}`)
                }
            }


            remindedForActivity(futureActivities[activity].activityID)

        }
    }
}




module.exports = { remindEveryone };