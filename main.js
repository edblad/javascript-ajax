const authKey = '08fd13eb5afe4d5dbc7ba3a4ddd5ddcd';
const button = document.getElementById('button');
const searchCity = document.getElementById('searchCity');

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

    function fetchStation(searchValue){
    fetch('http://api.trafikinfo.trafikverket.se/v1.3/data.json', stationsOptions)
        .then(function(response){       
            return response.json();
        })
        .then(function(stationData){    
            getStation(stationData, searchValue);
            //console.log(data.RESPONSE.RESULT[0]);
            //returnStation(data);
        })
        .catch(function(error){
            console.log(error)
        });
    }

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
        const dataArray = data.RESPONSE.RESULT[0].TrainAnnouncement;
        console.log(dataArray);
        
//            for(const i = 0; i < dataArray.length; i++){
//                if(dataArray[i].ToLocation[0].LocationName){
//                    console.log(dataArray[i].ToLocation[0].LocationName);
//                }
//            }
        
        //showSomething(data)
    })
    .catch(function(error){
        console.log(error)
    });
}

//fetchStation();
//fetchTimeTable();

//function returnStation(data){
//    const dataArray = data.RESPONSE.RESULT[0].TrainStation;
//    console.log(data.RESPONSE.RESULT[0]);
//    for(i = 0; i < dataArray.length; i++){
//        if(dataArray[i].LocationSignature == 'A'){
//            //console.log(dataArray[i].AdvertisedLocationName);
//        }
//    }
//    //console.log(dataArray);
//}
//
//function showSomething(data){
//    const dataArray = data.RESPONSE.RESULT[0].TrainAnnouncement;
//    console.log(data.RESPONSE.RESULT[0]);
//    let clickedLocation = '';
//    for(i = 0; i < dataArray.length; i++){
//        clickedLocation = dataArray[200].ToLocation[0].LocationName;
//    }
//    //console.log(clickedLocation);
//    //return clickedLocation;
//}


button.addEventListener('click', function(){
    fetchTimeTable();
    fetchStation();
});

searchCity.addEventListener('change', function(){
    const searchValue = searchCity.value;
    fetchStation(searchValue);
});

function getStation(stationData, searchValue){
    const dataArray = stationData.RESPONSE.RESULT[0].TrainStation;
    for(i = 0; i < dataArray.length; i++){
        if(searchValue == dataArray[i].AdvertisedLocationName){
           console.log(dataArray[i].AdvertisedLocationName)
        }
    }
}