const { createActivity } = require('../db.js')

async function whatsappGroup(message, client) {

    const chat = await message.getChat()

    if (message.body.replace('@41794706505', '').replace(/\s/g, "").trim != '') {
        return
    }



    await chat.sendMessage('Bitte verwende für alle Kommunikation mit mir *<< @Pfadi Hü >>*\n *1)* Zeige alle Aktivitäten\n *2)* Alle Abmeldungen für die Nächste Aktivität\n *3)* Eine neue Aktivität erstellen');

    setTimeout(() => { return; }, 5000);

    client.on('message', async(message) => {
        let messageText = message.body.replace('@41794706505 ', '')
        if (messageText == 1) {
            chat.sendMessage("test")
        }
    })


}


module.exports = { whatsappGroup };