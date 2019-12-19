/*
 * Purpose      : The purpose of this assignment project is
 *                to get forecasts weather on today or past 29
 *                days from the location which user want.
 * Last Modified: 29 May 2016
 */

// This class should act as a cache for the forecast.io API. That is,
// when the app requests the weather for a particular location and
// date, the app should check the cache and return this information
// if it is stored locally by the class, otherwise it should request 
// this data from the API, and then store the result in in the class
// and notify the app via a callback when it receives the information.

// Returns a date in the format "YYYY-MM-DD".
Date.prototype.simpleDateString = function() {
    function pad(value) {
        return ("0" + value).slice(-2);
    }

    var dateString = this.getFullYear() + "-" +
        pad(this.getMonth() + 1, 2) + '-' +
        pad(this.getDate(), 2);

    return dateString;
}

// Date format required by forecast.io API.
// We always represent a date with a time of midday,
// so our choice of day isn't susceptible to time zone errors.
Date.prototype.forecastDateString = function() {
    return this.simpleDateString() + "T12:00:00";
}

// Global variable for location weather cache class instance.
var singletonLocationWeatherCache;
// Local storage key
var STORAGE_KEY = "Locations Weather App";

// LocationWeatherCache class
function LocationWeatherCache() {
    // Private attributes:
    var locations = [];
    var callbacks = {};

    // Public methods:

    // Returns the number of locations stored in the cache.
    //
    this.length = function() {
        return locations.length;
    };

    // Returns the location object for a given index.
    // Indexes begin at zero.
    //
    this.locationAtIndex = function(index) {
        return locations[index];
    };

    // Given a latitude, longitude and nickname, this method saves a
    // new location into the cache.  It will have an empty 'forecasts'
    // property.  Returns the index of the added location.
    //
    this.addLocation = function(latitude, longitude, nickname) {
        var addNewLocation = {
            nickname: nickname,
            lat: latitude,
            lng: longitude,
            weatherForecasts: {}
        };

        locations.push(addNewLocation);
        saveLocations();

        return locations.length - 1;
    };

    // Removes the saved location at the given index.
    //
    this.removeLocationAtIndex = function(index) {
        locations.splice([index], 1)
        saveLocations();
    }

    // This method is used by JSON.stringify() to serialise this class.
    // Note that the callbacks attribute is only meaningful while there
    // are active web service requests and so doesn't need to be saved.
    //
    this.toJSON = function() {
        return locations;
    };

    // Given a public-data-only version of the class (such as from
    // local storage), this method will initialise the current
    // instance to match that version.
    //
    this.initialiseFromPDO = function(locationWeatherCachePDO) {
        locations = locationWeatherCachePDO;
    };

    // Request weather for the location at the given index for the
    // specified date.  'date' should be JavaScript Date instance.
    //
    // This method doesn't return anything, but rather calls the
    // callback function when the weather object is available. This
    // might be immediately or after some indeterminate amount of time.
    // The callback function should have two parameters.  The first
    // will be the index of the location and the second will be the
    // weather object for that location.
    //
    this.getWeatherAtIndexForDate = function(index, date, callback) {
        var locationDate = locations[index].lat + "," +
            locations[index].lng + "," + date.forecastDateString();

        //Checks the cache and returns a cache result if one exists
        if (locations[index].weatherForecasts.hasOwnProperty(locationDate))
        {
            callback(index, locations[index].weatherForecasts[locationDate]);
        }
        else
        {
            callbacks[locationDate] = callback;

            // A request is made to api.forecast.io via JSONP for {lat},{lng},{date}   and date is formatted with Date.forecastDateString().

            // Make the request
            var url = "https://api.forecast.io/forecast/3956d60e0d22c121fddf161c235e458a/" + locationDate
            var data = {
                units : "ca", // in SI unit except for wind speed which is in km/h.
                exclude: "currently,minutely,hourly" // minutely , hourly and currently data blocks are ignored as we are only interested in daily property
            };

            // Given a URL of a web service and a data object containing
            // properties for each parameter, constructs the complete URL
            // and makes a request to the web service via JSONP.

            // Build URL parameters from data object.
            var params = "";

            // For each key in data object
            for (var key in data)
            {
                // First parameter starts with '?'
                if (params === "")
                {
                    params += "?";
                }
                else
                {
                    // Subsequent parameter separated by '&'
                    params += "&";
                }

                params += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
            }

            // Perform the request.
            // LocationWeatherCache.weatherResponse is specified as the callback.
            var script = document.createElement("script");
            script.src = url + params + "&callback=singletonLocationWeatherCache.weatherResponse";
            document.body.appendChild(script);
        };
     };

    // This is a callback function passed to forecast.io API calls.
    // This will be called via JSONP when the API call is loaded.
    //
    // This should invoke the recorded callback function for that
    // weather request.
    //
    this.weatherResponse = function(response) {

        var locationIndex = indexForLocation(response.latitude, response.longitude);
        var weatherDailyInfo = response.daily.data[0];

        if (typeof comparisonDate == 'function')
        {
            var date=comparisonDate();
        }
        else
        {
            date=new Date();
        };

        if(locationIndex===-1)
            {
                var locationDate = response.latitude + "," + response.longitude + "," + date.forecastDateString();

            }
        else
            {
                var locationDate = locations[locationIndex].lat + "," + locations[locationIndex].lng + "," + date.forecastDateString();

        locations[locationIndex].weatherForecasts[locationDate] = weatherDailyInfo;

        // Save weather info to local storage
        saveLocations();
            }


        //Prevent the value of oninput() on slider changed rapid which caused an error function
        if (typeof(callbacks[locationDate])=='function' )
        {
              callbacks[locationDate](locationIndex, weatherDailyInfo);
        }

        delete callbacks[locationDate];

    };

     // Only available for current location feature.
    // Same function as this.getWeatherAtIndexForDate.
    // The difference is first parameter, as the parameter
    // is object which contains only current location instead of index.
    //
    this.currentWeather=function (location,date,callback) {
        var locationDate = location.lat + "," +
            location.lng + "," + date.forecastDateString();

            callbacks[locationDate] = callback;

            // A request is made to api.forecast.io via JSONP for {lat},{lng},{date}   and date is formatted with Date.forecastDateString().

            // Make the request
            var url = "https://api.forecast.io/forecast/3956d60e0d22c121fddf161c235e458a/" + locationDate
            var data = {
                units : "ca", // in SI unit except for wind speed which is in km/h.
                exclude: "currently,minutely,hourly" // minutely , hourly and currently data blocks are ignored as we are only interested in daily property
            };

            // Given a URL of a web service and a data object containing
            // properties for each parameter, constructs the complete URL
            // and makes a request to the web service via JSONP.

            // Build URL parameters from data object.
            var params = "";

            // For each key in data object
            for (var key in data)
            {
                // First parameter starts with '?'
                if (params === "")
                {
                    params += "?";
                }
                else
                {
                    // Subsequent parameter separated by '&'
                    params += "&";
                }

                params += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
            }

            // Perform the request.
            // LocationWeatherCache.weatherResponse is specified as the callback.
            var script = document.createElement("script");
            script.src = url + params + "&callback=singletonLocationWeatherCache.weatherResponse";
            document.body.appendChild(script);

    };

    // Private methods:

    // Given a latitude and longitude, this method looks through all
    // the stored locations and returns the index of the location with
    // matching latitude and longitude if one exists, otherwise it
    // returns -1.
    //
    function indexForLocation(latitude, longitude)
    {
        for (var position = 0; position < locations.length; position++)
        {
            if (locations[position].lat === latitude && locations[position].lng === longitude)
            {
                return position;
            }
        }
        return -1;
    };
};

//Check local storage for an existing cache object.
loadLocations();


// Restore the singleton locationWeatherCache from Local Storage.
function loadLocations()
{
    //create a single LocationWeatherCache class instance in a global variable.
    singletonLocationWeatherCache = new LocationWeatherCache();

    if (localStorage.getItem(STORAGE_KEY) !== null)
    {
        var STORAGE_VALUE = JSON.parse(localStorage.getItem(STORAGE_KEY));
        singletonLocationWeatherCache.initialiseFromPDO(STORAGE_VALUE);
    };
};

// Save the singleton locationWeatherCache to Local Storage.
//
function saveLocations()
{
    var STORAGE_VALUE = JSON.stringify(singletonLocationWeatherCache);
    localStorage.setItem(STORAGE_KEY, STORAGE_VALUE);
};
