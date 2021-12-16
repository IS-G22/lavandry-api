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
                var expectedResult = [
                    { "_id": "61a3405a1401f80b38406ec1", "id": 2, "nome": "Delicati", "durata": 100 },
                    { "_id": "61a3405a1401f80b38406ec0", "id": 1, "nome": "Rapido", "durata": 60 },
                    { "_id": "61a3405a1401f80b38406ec2", "id": 3, "nome": "30 Gradi", "durata": 120 }
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






});