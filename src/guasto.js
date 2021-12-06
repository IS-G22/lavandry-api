exports.list = async (_, response) => {
    if(response.data.lavatrice && response.data.text){
        console.log("Invia una email al tecnico riguardo la Lavatrice "+response.data.lavatrice+".\nSegnalazione: "+response.data.text);
        response.send("success!");
    }else{
        response.send("failure!");
    }
}