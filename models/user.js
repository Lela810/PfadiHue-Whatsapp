const mongoose = require("mongoose")
const encrypt = require('mongoose-encryption');

const userSchema = new mongoose.Schema({
    userID: {
        type: Object,
        required: true,
        unique: true,
        index: true
    },
})


var encKey = process.env.ENCKEY;
var sigKey = process.env.SIGKEY;

userSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, decryptPostSave: false, additionalAuthenticatedFields: ['userID'], excludeFromEncryption: ['userID'] });


module.exports = mongoose.model('user', userSchema)