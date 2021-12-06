var mongo = require('mongodb');
const { LIBERO } = require('./crea-prenotazione');

exports.prenotazioni_utente = async (request, response) => {
    if (!global.database) {
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let query = {
        id_utente: -1,
    };


    if (request.query.id_utente) {
        query.id_utente = parseInt(request.query.id_utente)
        response.send(await slots.find(query).toArray());
    } else {
        response.send("Inserisci il parametro <b>id_utente</b>")
    }
}

exports.prenotazioni_attive_utente = async (request, response) => {
    if (!global.database) {
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let query = {
        id_utente: -1,
        data_fine: { $gte: (new Date()).getTime() }
    };


    if (request.query.id_utente) {
        query.id_utente = parseInt(request.query.id_utente);
        response.send(await slots.find(query).toArray());
    } else {
        response.send("Inserisci il parametro <b>id_utente</b>")
    }
}

exports.cancella = async (request, response) => {
    if (!global.database) {
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }

    if (!request.query.id_prenotazione) {
        response.send("Inserisci il parametro <b>id_prenotazione</b>")
        return;
    }
    let id_prenotazione = request.query.id_prenotazione;
    let query = { _id: new mongo.ObjectID(id_prenotazione) };
    let prenotazione = await slots.findOne(query);

    console.log("Update:", await slots.deleteOne(query));
    param = {
        id_lavatrice: prenotazione.id_lavatrice,
        data_inizio: prenotazione.data_inizio,
        data_fine: prenotazione.data_fine,
        stato: this.LIBERO
    };
    console.log("Inset:", await slots.insertOne(param));
    response.send(prenotazione);
};