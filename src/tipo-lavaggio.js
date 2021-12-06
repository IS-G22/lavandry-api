exports.list = async (_, response) => {
    if (!global.database) {
        response.send({ error: "DataBase non raggiungibile" })
        return;
    }
    response.send(await tipiLavaggio.find().toArray());
}