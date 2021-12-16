var test = require('tape');
var mocha = require('mocha')
var assert = require('assert');
var request = require('supertest');
var { app, onReady } = require('../src');

onReady(() => {

    test('Controllo sui tipi di lavaggio', function (assert) {
        request(app)
            .get('/api/tipo-lavaggio')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                var expectedResult =
                    [
                        { _id: '61a3405a1401f80b38406ec0', durata: 60, id: 1, nome: 'Rapido' },
                        { _id: '61a3405a1401f80b38406ec1', durata: 100, id: 2, nome: 'Delicati' },
                        { _id: '61a3405a1401f80b38406ec2', durata: 120, id: 3, nome: '30 Gradi' }
                    ];

                assert.error(err, 'Nessun errore');
                assert.same(res.body, expectedResult, 'Ricevuti tutti i tipi di lavaggio aspettati');
                assert.end();
            });
    });
    test('Controllo sul blocco della lavatrice 1', assert => {
        
        request(app)
            .post('/api/lavatrici/blocca')
            .query({ id_lavatrice: 1 })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                // var giaBloccata = { status: 'ok', msg: 'lavatrice già bloccata', stato: 'bloccata' };
                var oraBloccata = { status: 'ok', stato: 'bloccata' };

                assert.error(err, 'Nessun errore');
                assert.same(res.body, oraBloccata, 'Ricevuto il messaggio aspettato, Lavatrice è bloccata');
                assert.end();
            });
    });
    test('Controllo sul blocco della lavatrice 1 quando è già bloccata', assert => {
        request(app)
            .post('/api/lavatrici/blocca')
            .query({ id_lavatrice: 1 })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                var giaBloccata = { status: 'ok', msg: 'lavatrice già bloccata', stato: 'bloccata' };

                assert.error(err, 'Nessun errore');
                assert.same(res.body, giaBloccata, 'Ricevuto il messaggio aspettato, Lavatrice è bloccata');
                assert.end();
            });
    });
    test('Controllo su errore nello sblocco della lavatrice 1 (se non invio il parametro id_lavatrice)', assert => {
        request(app)
            .post('/api/lavatrici/sblocca')
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function (err, res) {
                // var giaBloccata = { status: 'ok', msg: 'lavatrice già bloccata', stato: 'bloccata' };
                var expectedResult = { error: "Inserisci il parametro <b>id_lavatrice</b>" };

                assert.error(err, 'Nessun errore');
                assert.same(res.body, expectedResult, 'Ricevuto il messaggio aspettato');
                assert.end();
            });
    });
    test('Controllo sullo sblocco della lavatrice 1', assert => {
        request(app)
            .post('/api/lavatrici/sblocca')
            .query({ id_lavatrice: 1 })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                // var giaBloccata = { status: 'ok', msg: 'lavatrice già bloccata', stato: 'bloccata' };
                var oraBloccata = { status: 'ok', stato: 'sbloccata' };

                assert.error(err, 'Nessun errore');
                assert.same(res.body, oraBloccata, 'Ricevuto il messaggio aspettato, Lavatrice è sbloccata');
                assert.end();
            });
    });
    test('Controllo sullo sblocco della lavatrice 1 quando è già sbloccata', assert => {
        request(app)
            .post('/api/lavatrici/sblocca')
            .query({ id_lavatrice: 1 })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                var giaSbloccata = { status: 'ok', msg: 'lavatrice già sbloccata', stato: 'sbloccata' };

                assert.error(err, 'Nessun errore');
                assert.same(res.body, giaSbloccata, 'Ricevuto il messaggio aspettato, Lavatrice è sbloccata');
                assert.end();
            });
    });

});