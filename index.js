(async() => {
    await require('dotenv').config()
    const { startWhatsapp } = require('./js/whatsapp.js');



    await startWhatsapp()

})();