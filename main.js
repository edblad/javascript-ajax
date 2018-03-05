const authKey = '08fd13eb5afe4d5dbc7ba3a4ddd5ddcd';

const stationsRequest = `
<REQUEST>
  <LOGIN authenticationkey="${authKey}" />
  <QUERY objecttype="TrainStation">
    <FILTER />
  </QUERY>
</REQUEST>
`;

const postOptions = {
    method: 'POST',
    headers: { 'content-type': 'text/xml' },
    body: stationsRequest
}

function fetchStation(){
fetch('http://api.trafikinfo.trafikverket.se/v1.3/data.json', postOptions)
    .then(function(response){       
        return response.json();
    })
    .then(function(data){           
        console.log(data);
        console.log(data.RESPONSE.RESULT[0].TrainAnnouncement[0].ToLocation[0].LocationName)
    })
    .catch(function(error){
        console.log(error)
    });
}

fetchStation();