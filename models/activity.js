const mongoose = require("mongoose")
const encrypt = require('mongoose-encryption');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const activitySchema = new mongoose.Schema({
    activityID: {
        type: Number,
        unique: true,
        index: true
    },
    date: {
        type: Date,
        index: true
    },
    startzeit: {
        type: String,
        required: false
    },
    endzeit: {
        type: String,
        required: false
    },
    meldungen: {
        type: Object,
        required: false
    },
    leiter: {
        type: Object,
        required: false
    }
})


var encKey = process.env.ENCKEY;
var sigKey = process.env.SIGKEY;

activitySchema.plugin(AutoIncrement, { inc_field: 'activityID' });
//activitySchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, decryptPostSave: false, additionalAuthenticatedFields: ['activityID'], excludeFromEncryption: ['activityID'] });



module.exports = mongoose.model('activity', activitySchema)