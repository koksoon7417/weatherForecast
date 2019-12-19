// Global variables of latitude, longitude, nickname of locations and info window/annotations on map
var currentInfoWindow = null;
var locationObject = {
    gpsLocationLat: [],
    gpsLocationLng: [],
    nickname: "" 
};
var nicknameAddress = {
    formattedAddress: ""
};

//Public API key
mapboxgl.accessToken = 'pk.eyJ1Ijoia3N0YW40NSIsImEiOiJjazNqdDlvMDQwbXRiM2tudTY3MHBuaHl0In0.ZQn4DteK9eI37jlT63zCVg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [101.6958, 3.1466],
    zoom: 12
});
 
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder : 'Enter a town or address...'
});

document.getElementById('address').appendChild(geocoder.onAdd(map));

geocoder.on('result', function(ev) {
  var nickname = ev.result.text;
  var coordinates = ev.result.geometry.coordinates;
  
  document.getElementById('nickname').value = nickname;
  
  locationObject.gpsLocationLat = coordinates[1];
  locationObject.gpsLocationLng = coordinates[0];
  nicknameAddress.formattedAddress = nickname;
});

// The current GPS location and nickname of location is added to the LocationWeatherCache object when 
// click on the 'add location' button and returned to the Locations List page (index.html). 
// If no nickname is specified, the formatted address from the geocoding request is used.
 document.getElementById('addbutton').addEventListener("click",function(){
    if (document.getElementById('address').value=== "") 
    {
        //If no input address is entered, alert user to enter a valid address
        alert("Please enter a valid location!")
    }
    else
    {
        locationObject.nickname = document.getElementById('nickname').value;
        singletonLocationWeatherCache.addLocation(locationObject.gpsLocationLat,locationObject.gpsLocationLng,locationObject.nickname);
    }
 });