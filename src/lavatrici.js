var mongo = require('mongodb');
exports.BLOCCATA = 'bloccata';
exports.SBLOCCATA = 'sbloccata';

exports.lista = async (_, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    response.send(await lavatrici.find().sort({ id: 1 }).toArray());
}

exports.add = async (request, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    response.send(await lavatrici.insertOne(request.query));
}
exports.apri = async (request, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let id_lavatrice = -1;
    if (!request.params.id_lavatrice) {
        response.status(400)
        response.send({ error: "Inserisci il parametro <b>id_lavatrice</b>", status: 'err' })
        return;
    }
    id_lavatrice = parseInt(request.params.id_lavatrice);
    console.log(id_lavatrice)
    let lavatrice = await lavatrici.findOne({ id: id_lavatrice });
    if (lavatrice)
        response.send(lavatrice);
    else {
        response.status(404);
        response.send({ error: "Lavatrice inesistente" });
    }
}

exports.apriDaPrenotazione = async (request, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let id_prenotazione = -1;
    if (!request.query.id_prenotazione) {
        response.status(400)
        response.send({ error: "Inserisci il parametro <b>id_prenotazione</b>", status: 'err' })
        return;
    }
    id_prenotazione = parseInt(request.query.id_prenotazione);
    console.log(id_prenotazione)
    let prenotazione = await logs.findOne({ _id: new mongo.ObjectId(id_prenotazione) });
    if (prenotazione)
        response.send(await lavatrici.findOne({ id: prenotazione.id_lavatrice }));
    else {
        response.status(404);
        response.send({ error: "Prenotazione inesistente" });
    }
}

exports.blocca = async (request, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let id_lavatrice = -1;
    if (!request.query.id_lavatrice) {
        response.status(400)
        response.send({ error: "Inserisci il parametro <b>id_lavatrice</b>" })
        return;
    }
    id_lavatrice = parseInt(request.query.id_lavatrice);
    let lavatrice = await lavatrici.findOne({ id: id_lavatrice });

    if (lavatrice)
        if (lavatrice.stato == this.SBLOCCATA) {

            lavatrici.updateOne({ id: id_lavatrice }, { $set: { stato: this.BLOCCATA } }, { upsert: false });

            cancellaSlotFuturi(id_lavatrice);

            response.send({ status: 'ok', stato: this.BLOCCATA });
        }
        else {
            response.send({ status: 'ok', msg: 'lavatrice già bloccata', stato: this.BLOCCATA })
        }
    else {
        response.status(404)
        response.send({ status: 'error', error: 'lavatrice inesistente' })
    }
}

exports.sblocca = async (request, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let id_lavatrice = -1;
    if (!request.query.id_lavatrice) {
        response.status(400)
        response.send({ error: "Inserisci il parametro <b>id_lavatrice</b>" })
        return;
    }
    id_lavatrice = parseInt(request.query.id_lavatrice);
    let lavatrice = await lavatrici.findOne({ id: id_lavatrice });

    if (lavatrice)
        if (lavatrice.stato == this.BLOCCATA) {

            lavatrici.updateOne({ id: id_lavatrice }, { $set: { stato: this.SBLOCCATA } }, { upsert: false });

            await cancellaSlotFuturi(id_lavatrice);

            let inserito = await slots.insertOne({
                data_inizio: (new Date()).getTime(),
                data_fine: 9999999999999.0,
                stato: "libero",
                id_lavatrice: id_lavatrice
            });
            console.log("inserito: ", inserito);

            response.send({ status: 'ok', stato: this.SBLOCCATA });
        }
        else {
            response.send({ status: 'ok', msg: 'lavatrice già sbloccata', stato: this.SBLOCCATA })
        }
    else {
        response.status(404)
        response.send({ status: 'error', error: 'lavatrice inesistente' })
    }
}


async function cancellaSlotFuturi(id_lavatrice) {
    let cancellati = await slots.deleteMany({
        $and: [
            { "id_lavatrice": id_lavatrice },
            { "data_inizio": { $gte: (new Date()).getTime() } }
        ]
    });
    let modificati = await slots.updateMany(
        {
            $and: [
                { "id_lavatrice": id_lavatrice },
                { "data_fine": { $gt: (new Date()).getTime() } }
            ]
        },
        { $set: { data_fine: (new Date()).getTime() } },
        { upsert: false }
    );
    console.log("cancellati: ", cancellati);
    console.log("modificati: ", modificati);
}