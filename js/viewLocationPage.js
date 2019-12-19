/*
 * Purpose      : The purpose of this assignment project is
 *                to get forecasts weather on today or past 29
 *                days from the location which user want.
 * Last Modified: 29 May 2016
 */

// Code for the View Location page.
// The weather information displayed for the selected date and location include:
// ● A text summary of current conditions, e.g., “Partly Cloudy”
// ● Minimum temperature in ℃
// ● Maximum temperature in ℃
// ● Current humidity in %
// ● Current wind speed in km/h

//Global variables
// Get and return index of selected location from local storage "Location Weather App - Saved Location Index"
var locationIndex = localStorage.getItem(STORAGE_KEY + "-Saved Location Index");
var selectedLocation = singletonLocationWeatherCache.locationAtIndex(locationIndex);
// Get elements from HTML
var onSlider = document.getElementById('slider');
var onDeleteButton = document.getElementById('deleteButton');
var outputWeather=document.getElementById('weather');
var outputDate=document.getElementById('date');
// For GPS feature.
var geo_options = {
  enableHighAccuracy: true,
  maximumAge        : 0,
  timeout           : Infinity
};
//Public API key
mapboxgl.accessToken = 'pk.eyJ1Ijoia3N0YW40NSIsImEiOiJjazNqdDlvMDQwbXRiM2tudTY3MHBuaHl0In0.ZQn4DteK9eI37jlT63zCVg';


//For current location feature.
if (locationIndex==-1)
{
    // Start the location at KLCC.
    selectedLocation={
        lat: 3.1466,
        lng: 101.6958,
        nickname: "Current Location"
    };
    document.getElementById("headerBarTitle").textContent = selectedLocation.nickname;
}
// Set header bar title as the specified nickname
else if (locationIndex !== null)
{
    document.getElementById("headerBarTitle").textContent = selectedLocation.nickname;
}

// For current location feature.
if (locationIndex==-1)
{
    onSlider.parentNode.removeChild(onSlider);
    onDeleteButton.parentNode.removeChild(onDeleteButton);

    if ("geolocation" in navigator)
    {
        /* geolocation is available */
        navigator.geolocation.watchPosition(getPosition, geo_error, geo_options);
        outputDate.innerHTML = "";
        outputWeather.innerHTML="Weather loading...";
    }
}
else
{
    // Obtain weather information through locationWeatherCache.js and dislpay onto
    // HTML.
    inititalSlider();
}

// Start render map
initialize();

// Remove the selected location when tap on the "Remove This Location" button.
onDeleteButton.addEventListener("click", function() {
    singletonLocationWeatherCache.removeLocationAtIndex(locationIndex);
});

// Functions of view location
//
// initialize()
//
// This is a google map API callback function.
// This function create a map and show that location.
// This is also porvide a radius of circle surrounded
// user's location when current location feature is used.
//
function initialize()
{
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 15
    });

    var popup = new mapboxgl.Popup()
        .setHTML(selectedLocation.nickname);

    var marker = new mapboxgl.Marker()
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .setPopup(popup)
      .addTo(map);

    //Only available on current location feature.
    //Show the radius on the user's current location.
   if (locationIndex==-1)
   {
         map.on('load', function() {
          map.addSource("source_circle_500", {
            "type": "geojson",
            "data": {
              "type": "FeatureCollection",
              "features": [{
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [selectedLocation.lng, selectedLocation.lat]
                }
              }]
            }
          });

          map.addLayer({
            "id": "circle500",
            "type": "circle",
            "source": "source_circle_500",
            "paint": {
              "circle-radius": {
                stops: [
                  [5, 1],
                  [15, 180]
                ],
                base: 2
              },
              "circle-color": "red",
              "circle-opacity": 0.6
            }
          });
        });
   }
};

// inititalSlider()
//
// A function that find the day changed from dragging slider and
// displays weather information for the selected date and location.
//
function inititalSlider()
{
    outputDate.innerHTML = "";
    outputWeather.innerHTML="Weather loading...";
    date=comparisonDate();
    singletonLocationWeatherCache.getWeatherAtIndexForDate(locationIndex,date, slider);
};

// comparisonDate()
//
// A function that returns the current day and the previous 29 days.
//
function comparisonDate()
{
    var date=new Date();
    var msecSince1970 = date.getTime();
    msecSince1970 -= (30-onSlider.value) * 24 * 60 * 60 * 1000;
    date.setTime(msecSince1970);

    return date;
};

// slider()
//
// A function that has been used when weather information has been retrieved from
// forecasts.io API and displays the weather information for the selected location:
// date, summary, minimum temperature, maximum temperature, humidity and wind speed.
//
// argument: index: postion of the locations which store in callbacks.
// argument: callbackInformation: weather information which obtained from
//           forecasts.io API.
//
function slider(index, callback)
{
    outputWeather.innerHTML = "";
    outputDate.innerHTML = "";
    outputDate.innerHTML += "<br>Weather " + date.simpleDateString() + " : " + "<br><br><br>";
    outputWeather.innerHTML += "Summary : " + callback.summary + "<br>";
    outputWeather.innerHTML += "Minimum Temperature : " + callback.temperatureMin + " &#176C <br>";
    outputWeather.innerHTML += "Maximum Temperature : " + callback.temperatureMax + " &#176C <br>";
    outputWeather.innerHTML += "Humidity : " + Number(callback.humidity * 100).toFixed(2) + " %<br>";
    outputWeather.innerHTML += "Wind Speed : " + callback.windSpeed + " km/h<br><br>";
};

// ======================================================================
//   GPS sensor code (geolocation)
// ======================================================================

// Functions of current location
//
// geo_error()
//
// Function to handle error for GPS feature.
//
function geo_error()
{
  alert("Sorry, no position available.");
};

// getPosition()
//
// Function to find and display current location and weather information.
//
// argument: position: position obtained from GPS callback function.
//
function getPosition(position)
{
    selectedLocation={
        lat:  position.coords.latitude,
        lng: position.coords.longitude,
        nickname: "Current Location"
    };
    initialize();
    date=comparisonDate();
    singletonLocationWeatherCache.currentWeather(selectedLocation,date, slider);
};
