var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://covid-19-data.p.rapidapi.com/help/countries?format=json",
    "method": "GET",
    "headers": {
        "x-rapidapi-host": "covid-19-data.p.rapidapi.com",
        "x-rapidapi-key": "d6a3a44921msh729ef7ac547d6cep1f6aa3jsn48332191f917"
    }
}

// create element for loop for table
$.ajax(settings).done(function(response) {
    console.log(response);
});