const activity = require('../models/activity.js');
const teilnehmer = require('../models/teilnehmer.js');
const moment = require('moment');



async function createTeilnehmer(json) {
    const teilnehmerEntry = new teilnehmer(json)

    try {
        await teilnehmerEntry.save()
    } catch (err) {
        throw err;
    }
}


async function checkTeilnehmer(tel) {
    try {
        if (await teilnehmer.countDocuments({ telephone: tel }) > 0) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.error(err);
        return false;
    }
}


async function createActivity(json) {

    if (!json.meldungen) {
        json['meldungen'] = {}
    }

    const activityEntry = new activity(json)

    try {
        await activityEntry.save()
    } catch (err) {
        throw err;
    }
}


async function registerForActivity(activityID, meldung) {
    let activityEntry = (await activity.find({ 'activityID': activityID }))[0];

    if (!activityEntry.meldungen) {
        activityEntry['meldungen'] = {}
    }

    activityEntry.meldungen[meldung.tel] = {
        name: meldung.name,
        pushname: meldung.pushname,
        tel: meldung.tel,
        timestamp: meldung.timestamp
    };

    activityEntry.markModified('meldungen')

    try {
        await activityEntry.save()
    } catch (err) {
        throw err;
    }
    return
}


async function unregisterForActivity(activityID, tel) {
    let activityEntry = (await activity.find({ 'activityID': activityID }))[0];

    try {
        delete activityEntry.meldungen[tel]
    } catch (err) {
        console.error(err);
        return err;
    }

    activityEntry.markModified('meldungen')

    try {
        await activityEntry.save()
    } catch (err) {
        throw err;
    }
    return
}


async function loadAllFutureActivities() {
    let activities
    try {
        activities = await activity.find({ date: { $gte: moment().startOf('day') } });
        return activities
    } catch (err) {
        console.error(err);
        return err;
    }
}

async function loadAllFutureActivitiesTN(minTimetoActivity) {
    let activities
    if (!minTimetoActivity) { minTimetoActivity = 1 }
    try {
        activities = await activity.find({ date: { $gte: moment().startOf('day') } });
        if (moment(activities[0].startzeit, 'HH:mm').subtract(minTimetoActivity, 'hour').format('HH:mm') <= moment().format('HH:mm')) {
            activities.splice(0, 1)
        }
        return activities
    } catch (err) {
        console.error(err);
        return err;
    }
}


async function loadAllActivities(find) {
    let activities
    if (!find) { find = {} }
    try {
        activities = await activity.find(find);
        return activities
    } catch (err) {
        console.error(err);
        return err;
    }
}

async function loadAllRegistrations(activityID) {

    try {
        let activityEntry = (await activity.find({ 'activityID': activityID }))[0];
        return activityEntry.meldungen
    } catch (err) {
        console.error(err);
        return err;
    }
}


module.exports = { checkTeilnehmer, createTeilnehmer, createActivity, loadAllActivities, registerForActivity, loadAllFutureActivities, loadAllRegistrations, unregisterForActivity, loadAllFutureActivitiesTN }