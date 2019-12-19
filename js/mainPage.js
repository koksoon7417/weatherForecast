/*
 * Purpose      : The purpose of this assignment project is
 *                to get forecasts weather on today or past 29
 *                days from the location which user want.
 * Last Modified: 29 May 2016
 */

// Code for the main app page (locations list).
// The app launches to page that displays a list of saved locations.
// This list will initially be empty. Each entry in the list displays
// the location nickname. For each location the current day’s low and
// high temperature and condition summary (as text or icon) is shown.
// Tapping on any entry in the Locations List should open the Location
// Weather page for that location.

// When first loading the app this information might not be available.
// Hence, the page should show that the weather for each entry is loading
// until the required data is returned from the forecast API.

// Global variables:
var listHTML = "";
var weatherSummary = "Loading...";


// To display a list of saved locations along with their weather icons,
// minimum and maximum temperature on location lists.
for (var i = 0; i < singletonLocationWeatherCache.length(); i++)
{
    var savedLocations = singletonLocationWeatherCache.locationAtIndex(i);

    // Display nickname and mininum and maximum temperature of the location on main page.
    listHTML += "<li class=\"mdl-list__item mdl-list__item--two-line\" onclick=\"viewLocation(" + i + ");\">";
    listHTML += "\<span class=\"mdl-list__item-primary-content\">";
    listHTML += "<img class=\"mdl-list__item-icon\" id=\"icon" + i + "\" src=\"images/loading.png\" class=\"list-avatar\" />";
    listHTML += "<span id=\"nickname\">" + savedLocations.nickname + "</span>";
    listHTML += "<span id=\"weather" + i + "\" class=\"mdl-list__item-sub-title\">" + weatherSummary + "</span></span></li>";

    document.getElementById("locationList").innerHTML = listHTML;
}

// Retrieve location, date and weather information from this.getWeatherAtIndexForDate
// and lists out the summary, minimum and maximum temperature of the saved locations.
for (var i = 0; i < singletonLocationWeatherCache.length(); i++)
{
    singletonLocationWeatherCache.getWeatherAtIndexForDate(i, new Date(), loading);
}

// Funtions
function viewLocation(locationName)
{
    // Save the index of desired location to local storage
    localStorage.setItem(STORAGE_KEY + "-Saved Location Index", locationName);
    // And load the view location page.
    location.href = 'viewlocation.html';
};

// loading()
//
// A function that lists out the summary, minimum and maximum temperature of the saved locations.
//
// argument:    index    : index of locations in locationWeatherCache.js
// argument: callback    : weather information which store inside callbacks
//                         with index of locations.
function loading(index, callback)
{
    var iconOutput = document.getElementById("icon" + index);
    var weatherOutput = document.getElementById("weather" + index);

    weatherSummary = "";
    icon = callback.icon;
    weatherSummary += "Min Temp : " + callback.temperatureMin + " &#176C , ";
    weatherSummary += "Max Temp : " + callback.temperatureMax + " &#176C";
    weatherOutput.innerHTML = weatherSummary;
    iconOutput.src = "images/" + icon + ".png";
};
