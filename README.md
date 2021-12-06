## Come testare l'API pubblicamente:
* Visita il link: [Documentazione API](https://lavadry.herokuapp.com/api-docs/#/)


## Come avviare l'API:
1. Scarica l'API sul tuo pc (o clona da git)
2. Dal terminale entra nella cartella con il file **package.json**
3. Per installare le dipendenze, digita nel terminale **npm install**
4. Nella stessa cartella del **package.json** crea un file **.env** inserendo nella prima riga "*DB_PASSWORD=~~pass~~*" (senza apici, con la password di accesso al db)
* NOTA: Per accedere al database devi prima aggiungere il tuo indirizzo ip come sicuro sul sito di mongoDB (*Security>Network Access>ADD IP ADRESS*)
5. Per avviare l'API da terminale: **npm run start**/**npm run dev**