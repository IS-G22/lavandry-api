console.log("Lavandry API started");
/**
 * Express
 */
const Express = require('express');
const app = Express();

/**
 * Path
 */
const path = require('path');

/**
 * Env
 * Carico il file che contiene la password per connettersi al database
 */
require('dotenv').config('./.env');


/**
 * Cors
 */
const cors = require('cors')
app.use(cors())


/**
 * Swagger
 */
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swagger.json');
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/** 
 * BodyParser
 */
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Mongo
 */
const MongoClient = require("mongodb").MongoClient;
const CONNECTION_STRING = "mongodb+srv://admin:" + process.env.DB_PASSWORD + "@lavandry.nmnxj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const DATABASE = "lavandry";

/**
 * MongoDB collections
 */
global.database;
global.tipiLavaggio;
global.lavatrici;
global.lavatrici_sbloccate;
global.prenotazioni;
global.slots;

/**
 * File esterni
 */
var Prenotazioni = require("./prenotazioni-v2");
var CreaPrenotazione = require("./crea-prenotazione");
var Lavatrici = require("./lavatrici");
var TipoLavaggio = require("./tipo-lavaggio");
var Guasto = require("./guasto");
/**
 * Avvio Express
 */

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            console.log(error)
        } else {
            global.database = client.db(DATABASE);
            console.log("Mongo DB Connection Successfull");

            /**
             * "Riempio" le variabili delle collezioni
             * In verità crea solo una pre-query sulla collection 
             */
            global.tipiLavaggio = global.database.collection("tipo-lavaggio");
            global.lavatrici = global.database.collection("lavatrici");
            global.lavatrici_sbloccate = global.database.collection("lavatrici_sbloccate");
            global.prenotazioni = global.database.collection("prenotazione_tipo_lavaggio");
            global.slots = global.database.collection("slots");
        }
    })
    console.log("Lavandry API is running!");
});
/**
 * Tipi di Lavaggio
 */

app.get("/api/tipo-lavaggio", TipoLavaggio.list);

/**
 * @swagger
 * /api/lavatrici:
 *   get:
 *     summary: Retrieve a list of lavatrici.
 *     description: Retrieve a list of lavatrici from the Server.
 *     responses:
 *       200:
 *         description: A list of lavatrici.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: integer
 *                         description: Id.
 *                         example: 67869
 *                       id:
 *                         type: integer
 *                         description: Id.
 *                         example: 1
 *                       hardware_id:
 *                         type: string
 *                         description: Id hardware.
 *                         example: jdkahoiha
 *                       stato:
 *                         type: string
 *                         description: Stato della lavatrice.
 *                         example: sbloccata
 * 
 */
app.get("/api/lavatrici", Lavatrici.lista);
//app.post("/api/lavatrici/add", Lavatrici.add);
app.get("/api/lavatrici/apri", Lavatrici.apri);
app.get("/api/lavatrici/blocca", Lavatrici.blocca);
app.get("/api/lavatrici/sblocca", Lavatrici.sblocca);

/**
 * Prenotazioni
 */
app.get("/api/prenotazioni/attive/utente", Prenotazioni.prenotazioni_attive_utente);
app.get("/api/prenotazioni/utente", Prenotazioni.prenotazioni_utente);
app.delete("/api/prenotazioni/cancella", Prenotazioni.cancella);

/**
 * Nuova Prenotazione
 */
app.get("/api/giorni-prenotabili", CreaPrenotazione.giorniPrenotabili);
app.get("/api/slot-disponibili", CreaPrenotazione.slotDisponibili)
app.post("/api/crea-prenotazione", CreaPrenotazione.creaPrenotazione)

/**
 * Segnalazione Guasto
 */

 app.post("/api/segnala", Guasto.Guasto);