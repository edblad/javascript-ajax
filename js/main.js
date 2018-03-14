// VARIABLES //
const authKey = '08fd13eb5afe4d5dbc7ba3a4ddd5ddcd';
let station = '';
let stationName = '';
let departArrive = '';
let time = '';
let trainNumber = '';
let track = '';
let newTime = '';
let searchValue = '';

const searchCity = document.getElementById('searchCity');
const output = document.getElementById('output');
const departure = document.getElementById('departure');
const arrival = document.getElementById('arrival');
const tableHead = document.getElementById('tableHead');
const cityHeadline = document.getElementById('city');


// EVENT LISTENERS //
departure.addEventListener('click', function(){
    if(searchCity.value){
        departArrive = 'Avgang';

        searchValue = searchCity.value;
        fetchStation(searchValue);

        searchCity.value = '';
    }else{
        if(cityHeadline){
           searchValue = cityHeadline.innerText;
        }
        output.innerHTML = '';
        departArrive = 'Avgang';
        fetchStation(searchValue);
    }
})

arrival.addEventListener('click', function(){
    if(searchCity.value){
        departArrive = 'Ankomst';

        searchValue = searchCity.value;
        fetchStation(searchValue);

        searchCity.value = '';
    }else{
        if(cityHeadline){
           searchValue = cityHeadline.innerText;
        }
        output.innerHTML = '';
        departArrive = 'Ankomst';
        fetchStation(searchValue);
    }
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
            //Look up the short name for the station
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
        <INCLUDE>Canceled</INCLUDE>
        <INCLUDE>TrackAtLocation</INCLUDE>
        <INCLUDE>ToLocation</INCLUDE>
        <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
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
            //console.log(data);
            showTrains(data);
        })
        .catch(function(error){
            console.log(error)
        });
}

function shortStationName(stationData, searchValue){
    const dataArray = stationData.RESPONSE.RESULT[0].TrainStation;
    
    cityHeadline.innerHTML = searchValue;
    
    //let shortStationName = '';
    
    // Check if trainstation exists and give 'station' the short name for the station
    for(i = 0; i < dataArray.length; i++){
        if(searchValue == dataArray[i].AdvertisedLocationName){
            station = dataArray[i].LocationSignature;
            fetchTimeTable();
        }
    }
}

function fullStationName(stationName, track, time, trainNumber, newTime){
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
            let tableRow = document.createElement('tr');
            let stationName = data.RESPONSE.RESULT[0].TrainStation[0].AdvertisedLocationName;
            
            tableRow.innerHTML += `<td>${time}</td><td>${stationName}</td><td>${newTime}</td><td>${track}</td><td>${trainNumber}</td>`;
            output.appendChild(tableRow);
            })
        .catch(function(error){
            console.log(error)
        });
}

function showTrains(data){
    let dataArray = data.RESPONSE.RESULT[0].TrainAnnouncement;

    tableHead.classList = 'showTableHead';
    
    for(let i = 0; i < dataArray.length; i++){
        if(dataArray[i].ToLocation){
            newTime = '';
            stationName = dataArray[i].ToLocation[0].LocationName;
            track = dataArray[i].TrackAtLocation;
            time = dataArray[i].AdvertisedTimeAtLocation;
            trainNumber = dataArray[i].AdvertisedTrainIdent;
            if(dataArray[i].EstimatedTimeAtLocation){
                newTime = dataArray[i].EstimatedTimeAtLocation;
            }
            
            fullStationName(stationName, track, time, trainNumber, newTime);
            
        }
    }
}






