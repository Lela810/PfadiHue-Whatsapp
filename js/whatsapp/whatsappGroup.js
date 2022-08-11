const { loadAllActivities, createActivity } = require('../db.js')
const { List } = require('whatsapp-web.js');


async function whatsappGroup(userMenu, message) {

    const chat = await message.getChat()

    let messageText = message.body.replace('@41794706505 ', '')
    switch (messageText) {
        case '1':
            userMenu = 1;
            break;
        case '2':
            userMenu = 2;
            break;
        case '3':
            userMenu = 3;
            break;
    }


    if (userMenu == 'start') {
        await chat.sendMessage('Bitte verwende für alle Kommunikation mit mir *<< @Pfadi Hü >>*\n *1)* Zeige alle Aktivitäten\n *2)* Alle Abmeldungen für die Nächste Aktivität\n *3)* Eine neue Aktivität erstellen');
        return ('start')
    }

    if (userMenu == 1) {
        console.log(await loadAllActivities())
        await chat.sendMessage("test")
        return (1)
    }

    if (userMenu == 2) {
        await chat.sendMessage(await loadAllActivities())
        return (2)
    }

    if (userMenu == 3) {
        //await createActivity()
        return (3)
            //await chat.sendMessage(await loadAllActivities())
    }


    return

}




module.exports = { whatsappGroup };