(async() => {
    await require('dotenv').config()
    const { startWhatsapp } = require('./js/whatsapp.js');
    const { connect, connection } = require('mongoose');




    if (!process.env.MONGODB_USERNAME || !process.env.MONGODB_PASSWORD) {
        connect(`mongodb://${process.env.MONGODB}/pfadihue-whatsapp`, { useNewUrlParser: true })
    } else {
        connect(`mongodb://${process.env.MONGODB_USERNAME}:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@${process.env.MONGODB}/pfadihue-whatsapp`, { useNewUrlParser: true })
    }

    const db = connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))





    await startWhatsapp()

})();