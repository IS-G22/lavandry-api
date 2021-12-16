var Formatter = require('./tools/formatter')
exports.LIBERO = 'libero';
exports.OCCUPATO = 'occupato';
exports.giorniPrenotabili = async (request, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let id_tipo_lavaggio;
    let tipoLavaggio;
    let durata_lavaggio = null;
    if (request.query.id_tipo_lavaggio) {

        id_tipo_lavaggio = parseInt(request.query.id_tipo_lavaggio)
        tipoLavaggio = await tipiLavaggio.findOne({ id: id_tipo_lavaggio });
        if (!tipoLavaggio) {
            response.status(404);
            response.send({ error: "Tipologia di Lavaggio inesistente" })
            return;
        }
        durata_lavaggio = tipoLavaggio.durata;

        let data_inizio_ricerca = new Date();
        let data_fine_ricerca = new Date(data_inizio_ricerca.getTime() + Formatter.DtoMs(14));


        let slots = await database.collection('slot_liberi_attivi').find({
            $and: [
                { "data_inizio": { "$lte": data_fine_ricerca.getTime() - Formatter.MtoMs(durata_lavaggio + 30) } },
                { "data_fine": { "$gte": data_inizio_ricerca.getTime() + Formatter.MtoMs(durata_lavaggio + 30) } },
                { "id_lavatrice": { $in: await getLavatriciSbloccate() } }
            ]
        }).toArray()
        let oggi = new Date(data_inizio_ricerca.toISOString());
        let array_giorni = Array.apply(null, { length: 14 }).map((_, number) => {
            let date = new Date(oggi.getTime() + Formatter.DtoMs(number));
            return { giorno: number, date: date }
        });
        //todo check

        array_giorni.filter((value, index) => {
            console.log(value);
            return (slots.some((slot) => {
                console.log(slot)
                return (slot.data_inizio <= value.date.getTime() && slot.data_fine >= value.date.getTime() + Formatter.MtoMs(durata_lavaggio + 30))
            }));
        })

        response.send(array_giorni);

    } else {
        response.send("Inserisci il parametro <b>id_tipo_lavaggio</b>")
    }
}

exports.slotDisponibili = async (request, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let id_tipo_lavaggio;
    let tipoLavaggio;
    let durata_lavaggio = null;

    let giorno;
    /** 
     * Controllo ci sia l'id del tipo di lavaggio
     */
    if (request.query.id_tipo_lavaggio) {
        id_tipo_lavaggio = parseInt(request.query.id_tipo_lavaggio)
        tipoLavaggio = await tipiLavaggio.findOne({ id: id_tipo_lavaggio });
        durata_lavaggio = tipoLavaggio.durata;
    } else {
        response.send({ error: "Inserisci il parametro <b>id_tipo_lavaggio</b>" })
        return;
    }
    /**
     * Controllo ci sia il giorno
     */
    if (request.query.giorno) {
        /**
         * giorno indica la differenza tra oggi e quando voglio prenotare la lavatrice:
         * 0 -> oggi
         * 1 -> domani
         * 2 -> tra due giorni
         * n -> tra n giorni
         * fino ad un massimo di 14 giorni (due settimane)
         */
        giorno = parseInt(request.query.giorno)
        if (giorno > 14) {
            response.send({ error: "Il campo <b> giorno </b> deve essere compreso tra 0 e 14" });
            return;
        }
    } else {
        response.send({ error: "Inserisci il parametro <b>giorno</b>" })
        return;
    }

    /**
     * cerco gli slot disponibili per questo giorno:
     */

    let tempo_inizio = new Date((new Date()).getTime() + giorno * Formatter.DtoMs(1));

    tempo_inizio = new Date(tempo_inizio.toDateString())
    tempo_inizio.setHours(8);
    let tempo_fine = new Date(tempo_inizio.getTime() + Formatter.DtoMs(1));

    if (giorno == 0) tempo_inizio.setHours((new Date()).getHours() + 1)

    let slots = await database.collection('slot_liberi_attivi').find({
        $and: [
            { "data_inizio": { "$lte": tempo_fine.getTime() - Formatter.MtoMs(durata_lavaggio + 30) } },
            { "data_fine": { "$gte": tempo_inizio.getTime() + Formatter.MtoMs(durata_lavaggio + 30) } },
            { "id_lavatrice": { $in: await getLavatriciSbloccate() } }
        ]
    }).toArray()

    // console.log("Slot liberi attivi: ", slots)

    let ora_inizio = tempo_inizio.getHours()
    let numero_slot = 24 - ora_inizio;

    let array_slots = Array.apply(null, { length: numero_slot }).map((_, number) => {
        let date = new Date(tempo_inizio.getTime() + Formatter.HtoMs(number));
        return { slot: date.getTime(), date: date }
    });
    let slot_liberi = array_slots.filter((value, index) => {
        return (slots.some((slot) => {
            // console.log("comparazione: ", {
            //     inizio_slot: slot.data_inizio,
            //     date: value.date.getTime(),
            //     fine_slot: slot.data_fine,
            //     fine: value.date.getTime() + Formatter.MtoMs(durata_lavaggio + 30),
            // })
            return (slot.data_inizio <= value.slot && slot.data_fine >= value.slot + Formatter.MtoMs(durata_lavaggio + 30))
        }));
    })

    response.send(slot_liberi)
}

exports.creaPrenotazione = async (request, response) => {
    if (!global.database) {
        response.status(503)
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    let id_tipo_lavaggio = -1;
    let durata_lavaggio = -1;
    let numero_slot = -1;
    let id_utente = -1;
    if (!request.query.id_tipo_lavaggio) {
        response.status(400)
        response.send({ error: "Inserisci il parametro <b>id_tipo_lavaggio</b>" })
        return;
    }
    if (!request.query.slot) {
        response.status(400)
        response.send({ error: "Inserisci il parametro <b>slot</b>" })
        return;
    }
    if (!request.query.id_utente) {
        response.status(400)
        response.send({ error: "Inserisci il parametro <b>id_utente</b>" })
        return;
    }
    /**
     * Ottengo il numero di prenotazioni attive dell'utente
     */
    let queryCount = {
        id_utente: id_utente,
        data_fine: { $gte: (new Date()).getTime() }
    };
    let numero = await slots.count(queryCount);
    /**
     * Se l'utente ha già due prenotazioni attive gli nego la possibilità di farne una terza
     */
    if (numero >= 2) {
        response.status(400)
        response.send({ error: "Non puoi eseguire l'operazione: hai raggiunto il numero massimo di prenotazioni" })
        return;
    }
    id_tipo_lavaggio = parseInt(request.query.id_tipo_lavaggio);
    numero_slot = parseInt(request.query.slot);
    id_utente = parseInt(request.query.id_utente);
    durata_lavaggio = (await tipiLavaggio.findOne({ id: id_tipo_lavaggio })).durata + 30;

    param = {
        id_lavatrice: { $in: await getLavatriciSbloccate() },
        data_inizio: { $lte: numero_slot },
        data_fine: { $gte: numero_slot + Formatter.MtoMs(durata_lavaggio + 30) },
        stato: this.LIBERO
    };


    console.log("query per trovare slot: ", param);
    slot = await slots.findOne(param)
    fine_slot_succ = 9999999999999;
    if (slot.data_fine != fine_slot_succ) {
        console.log("questo è uno slot limitato, cerco il suo successivo")
        slot_succ = await slots.find({
            id_lavatrice: slot.id_lavatrice,
            data_inizio: { $gte: slot.data_fine },

        }).sort({
            data_inizio: 1
        }).toArray()
        fine_slot_succ = slot_succ[0].data_fine;
        console.log("Slot succ a quello scelto: ", slot_succ)
    }
    console.log("slot libero: ", slot)

    slots.updateOne({ _id: slot._id }, { $set: { data_fine: numero_slot } }, { upsert: true });

    data_inizio_penotazione = numero_slot;
    data_fine_penotazione = numero_slot + Formatter.MtoMs(durata_lavaggio + 30);
    prenotazione = {
        data_inizio: numero_slot,
        data_fine: data_fine_penotazione,
        inizio_prenotazione: (new Date(data_inizio_penotazione)).toISOString(),
        fine_prenotazione: (new Date(data_fine_penotazione)).toISOString(),
        stato: this.OCCUPATO,
        id_lavatrice: slot.id_lavatrice,
        id_utente: id_utente,
        id_tipo_lavaggio: id_tipo_lavaggio
    };

    slot_succ_a_prenotazione = {
        data_inizio: numero_slot + Formatter.MtoMs(durata_lavaggio + 30),
        data_fine: fine_slot_succ,
        stato: this.LIBERO,
        id_lavatrice: slot.id_lavatrice,
    };

    console.log("Prenotazione: ", prenotazione);
    console.log("Succ a Prenotazione: ", slot_succ_a_prenotazione);
    slots.insertMany([prenotazione, slot_succ_a_prenotazione]);

    response.send({ status: "ok" })

}

function getLavatriciSbloccate() {
    return lavatrici_sbloccate.distinct('id');
}