const user = require('../models/user.js');


async function createUser(json) {

    const userEntry = new user(json)

    try {
        await userEntry.save()
    } catch (err) {
        throw err;
    }
}


async function findAndUpdate(userID, newKeyValue, key) {
    let userEntry = (await user.find({ 'userID': userID }))[0];
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
        userEntry = await user.find({ 'userID': userID }, { grades: 0 });
        return userEntry[0]
    } catch (err) {
        console.error(err);
        return err;
    }
}


async function loadUser(userID) {
    let userEntry
    try {
        userEntry = await user.find({ 'userID': userID });
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
        users = await user.find(find);
        return users
    } catch (err) {
        console.error(err);
        return err;
    }
}


module.exports = { createUser, loadAllUsers, findAndUpdate, loadUserNoGrades, loadUser }