const activity = require('../models/activity.js');


async function createActivity(json) {

    const activityEntry = new activity(json)

    try {
        await activityEntry.save()
    } catch (err) {
        throw err;
    }
}


async function findAndUpdate(userID, newKeyValue, key) {
    let userEntry = (await activity.find({ 'userID': userID }))[0];
    userEntry[key] = newKeyValue;
    try {
        await userEntry.save()
    } catch (err) {
        throw err;
    }
    return
}


async function loadUserNoGrades(userID) {
    let userEntry
    try {
        userEntry = await activity.find({ 'userID': userID }, { grades: 0 });
        return userEntry[0]
    } catch (err) {
        console.error(err);
        return err;
    }
}


async function loadUser(userID) {
    let userEntry
    try {
        userEntry = await activity.find({ 'userID': userID });
        return userEntry[0]
    } catch (err) {
        console.error(err);
        return err;
    }
}


async function loadAllUsers(find) {
    let users
    if (!find) { find = {} }
    try {
        users = await activity.find(find);
        return users
    } catch (err) {
        console.error(err);
        return err;
    }
}


module.exports = { createActivity, loadAllUsers, findAndUpdate, loadUserNoGrades, loadUser }