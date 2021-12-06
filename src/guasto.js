exports.guasto = (request, response) => {
    //console.log(request)
    if(request.query.lavatrice && request.query.text){
        console.log("Invia una email al tecnico riguardo la Lavatrice "+request.query.lavatrice+".\nSegnalazione: "+request.query.text);
        response.send("success!");
    }else{
        response.send("failure!");
    }
}