////// VARIABLES //////
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
const toFrom = document.getElementById('toFrom');
const errorMessage = document.getElementById('errorMessage');


////// EVENT LISTENERS //////
departure.addEventListener('click', function(){
    clickedButton('departure');
})

arrival.addEventListener('click', function(){
     clickedButton('arrival');
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

////// FUNCTIONS //////
function clickedButton(param){
    if(param === 'departure'){
        departure.classList = 'activeButton';
        arrival.classList = 'inactiveButton';
        toFrom.innerHTML = 'Till';

        if(searchCity.value){
            departArrive = 'Avgang';

            searchValue = searchCity.value;
            fetchStation(searchValue);

            searchCity.value = '';
            output.innerHTML = '';
        }else{
            if(cityHeadline){
               searchValue = cityHeadline.innerText;
            }
            output.innerHTML = '';
            departArrive = 'Avgang';
            fetchStation(searchValue);
        }
    }else if(param === 'arrival'){
        departure.classList = 'inactiveButton';
        arrival.classList = 'activeButton';
        toFrom.innerHTML = 'Från';
        
        if(searchCity.value){
            departArrive = 'Ankomst';

            searchValue = searchCity.value;
            fetchStation(searchValue);

            searchCity.value = '';
            output.innerHTML = '';
        }else{
            if(cityHeadline){
               searchValue = cityHeadline.innerText;
            }
            output.innerHTML = '';
            departArrive = 'Ankomst';
            fetchStation(searchValue);
        }
    }
}

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
            errorMessage.innerHTML = `<p>Nu bev det något fel</p><p>${error}</p>`;
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
        <INCLUDE>ActivityType</INCLUDE>
        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
        <INCLUDE>TrackAtLocation</INCLUDE>
        <INCLUDE>ToLocation</INCLUDE>
        <INCLUDE>FromLocation</INCLUDE>
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
            showTrains(data);
            console.log(data);
        })
        .catch(function(error){
            errorMessage.innerHTML = `<p>Nu bev det något fel</p><p>${error}</p>`;
        });
}

function shortStationName(stationData, searchValue){
    const dataArray = stationData.RESPONSE.RESULT[0].TrainStation;
    
    cityHeadline.innerHTML = searchValue;
    
    // Check if trainstation exists and give 'station' the short name for the station
    for(i = 0; i < dataArray.length; i++){
        if(searchValue == dataArray[i].AdvertisedLocationName){
            station = dataArray[i].LocationSignature;
            fetchTimeTable();
        }
    }
}

async function fullStationName(stationName, track, time, trainNumber, newTime){
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
    
    try{
        const response = await fetch('http://api.trafikinfo.trafikverket.se/v1.3/data.json', stationOptions);
        const data = await response.json();

        let tableRow = document.createElement('tr');
        stationName = data.RESPONSE.RESULT[0].TrainStation[0].AdvertisedLocationName;

        tableRow.innerHTML += `
            <td>${time}</td>
            <td>${stationName}</td>
            <td>${newTime}</td>
            <td>${track}</td>
            <td>${trainNumber}</td>
        `;
        
        output.appendChild(tableRow);
    }
    catch(error) {
        errorMessage.innerHTML = `<p>Nu bev det något fel</p><p>${error}</p>`;
    }
}

async function showTrains(data){
    let dataArray = data.RESPONSE.RESULT[0].TrainAnnouncement;
    
    tableHead.classList = 'showTableHead';
    
    for(let i = 0; i < dataArray.length; i++){
        if(dataArray[i].ActivityType == 'Avgang'){
            if(dataArray[i].ToLocation){
                newTime = '';
                stationName = dataArray[i].ToLocation[0].LocationName;
                track = dataArray[i].TrackAtLocation;
                time = getTime(dataArray[i].AdvertisedTimeAtLocation);
                trainNumber = dataArray[i].AdvertisedTrainIdent;

                if(dataArray[i].EstimatedTimeAtLocation){
                    newTime = getTime(dataArray[i].EstimatedTimeAtLocation);
                }

                await fullStationName(stationName, track, time, trainNumber, newTime);
            }
        }else{
            if(dataArray[i].FromLocation){
                newTime = '';
                stationName = dataArray[i].FromLocation[0].LocationName;
                track = dataArray[i].TrackAtLocation;
                time = getTime(dataArray[i].AdvertisedTimeAtLocation);
                trainNumber = dataArray[i].AdvertisedTrainIdent;

                if(dataArray[i].EstimatedTimeAtLocation){
                    newTime = getTime(dataArray[i].EstimatedTimeAtLocation);
                }

                await fullStationName(stationName, track, time, trainNumber, newTime);
            }
        }
    }
}

// Add 0 before minutes that are less than 10
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// Returns the correct time format
function getTime(timeDate) {
    let fullDateTime = new Date(timeDate);
    let h = addZero(fullDateTime.getHours());
    let m = addZero(fullDateTime.getMinutes());
    return h + "." + m;
}


