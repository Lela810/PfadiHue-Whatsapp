const activity = require('../models/activity.js');
const moment = require('moment');


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
        activities = await activity.find({ date: { $gte: moment().format() } });
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


module.exports = { createActivity, loadAllActivities, registerForActivity, loadAllFutureActivities, loadAllRegistrations }