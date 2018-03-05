const authKey = '08fd13eb5afe4d5dbc7ba3a4ddd5ddcd';

const stationsRequest = `
<REQUEST>
  <LOGIN authenticationkey="${authKey}" />
  <QUERY objecttype="TrainStation">
    <FILTER />
  </QUERY>
</REQUEST>
`;

const stationsOptions = {
    method: 'POST',
    headers: { 'content-type': 'text/xml' },
    body: stationsRequest
}

function fetchStation(){
fetch('http://api.trafikinfo.trafikverket.se/v1.3/data.json', stationsOptions)
    .then(function(response){       
        return response.json();
    })
    .then(function(data){           
        //console.log(data);
        returnSomething(data);
    })
    .catch(function(error){
        console.log(error)
    });
}

fetchStation();


const stationsTimeTable = `
<REQUEST>
  <LOGIN authenticationkey="${authKey}" />
  <QUERY objecttype="TrainAnnouncement" orderby="AdvertisedTimeAtLocation">
    <FILTER>
      <AND>
        <EQ name="ActivityType" value="Avgang" />
        <EQ name="LocationSignature" value="Cst" />
        <OR>
          <AND>
            <GT name="AdvertisedTimeAtLocation" value="$dateadd(-00:15:00)" />
            <LT name="AdvertisedTimeAtLocation" value="$dateadd(14:00:00)" />
          </AND>
          <AND>
            <LT name="AdvertisedTimeAtLocation" value="$dateadd(00:30:00)" />
            <GT name="EstimatedTimeAtLocation" value="$dateadd(-00:15:00)" />
          </AND>
        </OR>
      </AND>
    </FILTER>
    <INCLUDE>AdvertisedTrainIdent</INCLUDE>
    <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
    <INCLUDE>AdvertisedLocationName</INCLUDE>
    <INCLUDE>TrackAtLocation</INCLUDE>
    <INCLUDE>ToLocation</INCLUDE>
  </QUERY>
</REQUEST>
`;

const timeTableOptions = {
    method: 'POST',
    headers: { 'content-type': 'text/xml' },
    body: stationsTimeTable
}

function fetchTimeTable(){
fetch('http://api.trafikinfo.trafikverket.se/v1.3/data.json', timeTableOptions)
    .then(function(response){       
        return response.json();
    })
    .then(function(data){           
        //console.log(data);
        showSomething()
    })
    .catch(function(error){
        console.log(error)
    });
}

fetchTimeTable();

function returnSomething(data){
    const dataArray = data.RESPONSE.RESULT[0].TrainStation
    for(i=0;i<dataArray.length;i++){
        console.log(dataArray[i].AdvertisedLocationName);
    }
    console.log(dataArray);
}

function showSomething(){
   // console
}