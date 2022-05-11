const mongoose = require("mongoose")
const encrypt = require('mongoose-encryption');

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    subscribeDiscord: {
        type: Boolean,
        required: false
    },
    subscribeMail: {
        type: Boolean,
        required: false
    },
    url: {
        type: String,
        required: false
    },
    pin: {
        type: Number,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    otp: {
        type: String,
        required: false
    },
    mail: {
        type: String,
        required: false
    },
    grades: {
        type: Object,
        required: false
    }
})


var encKey = process.env.ENCKEY;
var sigKey = process.env.SIGKEY;

userSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, decryptPostSave: false, additionalAuthenticatedFields: ['userID'], excludeFromEncryption: ['subscribeMail', 'subscribeDiscord', 'userID', 'grades'] });


module.exports = mongoose.model('user', userSchema)