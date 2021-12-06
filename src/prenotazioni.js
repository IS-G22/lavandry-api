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
        response.send(await prenotazioni.find(query).toArray());
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
        data_max_fine: { $gte: (new Date()).getTime() }
    };


    if (request.query.id_utente) {
        query.id_utente = parseInt(request.query.id_utente);
        response.send(await prenotazioni.find(query).toArray());
    } else {
        response.send("Inserisci il parametro <b>id_utente</b>")
    }
}

exports.prenotazioni_cancella = async (request, response) => {
    if (!global.database) {
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    response.send({ status: 'ok' })
    /*let query = {
        id_prenotazione: -1,
    };


    if (request.query.id_utente) {
        query.id_utente = parseInt(request.query.id_utente);
        response.send(await prenotazioni.find(query).toArray());
    } else {
        response.send("Inserisci il parametro <b>id_utente</b>")
    }*/
}