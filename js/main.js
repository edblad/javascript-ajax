const authKey = '08fd13eb5afe4d5dbc7ba3a4ddd5ddcd';
let station = '';
let stationName = '';
let departArrive = '';
let time = '';
let trainNumber = '';
let track = '';

const searchCity = document.getElementById('searchCity');
const output = document.getElementById('output');
const departure = document.getElementById('departure');
const arrival = document.getElementById('arrival');


// EVENT LISTENERS //
departure.addEventListener('click', function(){
    departArrive = 'Avgang';
})

arrival.addEventListener('click', function(){
    departArrive = 'Ankomst';
})

searchCity.addEventListener('change', function(){
    const searchValue = searchCity.value;
    fetchStation(searchValue);
})

// Request to fetch all train stations in Sweden
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


// FUNCTIONS //
function fetchStation(searchValue){
    fetch('http://api.trafikinfo.trafikverket.se/v1.3/data.json', stationsOptions)
        .then(function(response){       
            return response.json();
        })
        .then(function(stationData){    
            shortStationName(stationData, searchValue);
        })
        .catch(function(error){
            console.log(error)
        });
}


function fetchTimeTable(){
    /* Request to fetch all announcements at a specific train station
     * The station name is fetched by the function fetchStation 
     */
    let stationsTimeTable = `
    <REQUEST>
      <LOGIN authenticationkey="${authKey}" />
      <QUERY objecttype="TrainAnnouncement" orderby="AdvertisedTimeAtLocation">
        <FILTER>
          <AND>
            <EQ name="ActivityType" value="${departArrive}" />
            <EQ name="LocationSignature" value="${station}" />
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
    
    fetch('http://api.trafikinfo.trafikverket.se/v1.3/data.json', timeTableOptions)
        .then(function(response){       
            return response.json();
        })
        .then(function(data){      
            console.log(data);
            showTrains(data);
        })
        .catch(function(error){
            console.log(error)
        });
}

function shortStationName(stationData, searchValue){
    const dataArray = stationData.RESPONSE.RESULT[0].TrainStation;
    let shortStationName = '';
    
    for(i = 0; i < dataArray.length; i++){
        if(searchValue == dataArray[i].AdvertisedLocationName){
            station = dataArray[i].LocationSignature;
            fetchTimeTable();
        }
    }
}

function fullStationName(stationName, track, time, trainNumber){
    const request = `
        <REQUEST>
          <LOGIN authenticationkey="${authKey}" />
          <QUERY objecttype="TrainStation">
            <FILTER>
                <EQ name="LocationSignature" value="${stationName}" />
            </FILTER>
          </QUERY>
        </REQUEST>
        `;

    const stationOptions = {
        method: 'POST',
        headers: { 'content-type': 'text/xml' },
        body: request
    }
    
    fetch('http://api.trafikinfo.trafikverket.se/v1.3/data.json', stationOptions)
        .then(function(response){       
            return response.json();
        })
        .then(function(data){
            let paragraph = document.createElement('p');
            let stationName = data.RESPONSE.RESULT[0].TrainStation[0].AdvertisedLocationName;
            
            paragraph.innerHTML += `${time}, ${stationName}, ${track}, ${trainNumber} <br />`;
            output.appendChild(paragraph);
            })
        .catch(function(error){
            console.log(error)
        });
}

function showTrains(data){
    let dataArray = data.RESPONSE.RESULT[0].TrainAnnouncement;
    
    for(let i = 0; i < dataArray.length; i++){
        if(dataArray[i].ToLocation){
            stationName = dataArray[i].ToLocation[0].LocationName;
            track = dataArray[i].TrackAtLocation;
            time = dataArray[i].AdvertisedTimeAtLocation;
            trainNumber = dataArray[i].AdvertisedTrainIdent;
            
            fullStationName(stationName, track, time, trainNumber);
            
        }
    }
}






