exports.guasto = (request, response) => {
    console.log(request)
    if(request.query.lavatrice && request.quey.text){
        console.log("Invia una email al tecnico riguardo la Lavatrice "+request.quey.lavatrice+".\nSegnalazione: "+request.quey.text);
        response.send("success!");
    }else{
        response.send("failure!");
    }
}