let restaurantSelected = false;
// Create map and set coordinates to Evanston
var mymap = L.map('map-one', {minZoom: 14, attributionControl: true}).setView([42.045597, -87.688568], 16);
// Import tileset
L.tileLayer('https://api.mapbox.com/styles/v1/dmdeloso/ckk0gkv9q1hoe17qrngmljsau/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZG1kZWxvc28iLCJhIjoiY2trMGZ6aXJhMDVqdDJvbnI4YzM5MHRraiJ9.nOwnc18LqvUNErSlg4N0AA').addTo(mymap);
// Initialize layer for markers
var layerGroup = L.layerGroup().addTo(mymap);
let restaurantList;
// Function to parse csv files
let rowConverter = function(d){
    return{
        name: d.RestaurantName,
        address: d.Address,
        website: d.WebsiteLink,
        XCoord: parseFloat(d.XCoord),
        YCoord: parseFloat(d.YCoord),
        availability: [[parseFloat(d.SundayOpen), parseFloat(d.SundayClose)], [parseFloat(d.MondayOpen), parseFloat(d.MondayClose)], [parseFloat(d.TuesdayOpen), parseFloat(d.TuesdayClose)], [parseFloat(d.WednesdayOpen), parseFloat(d.WednesdayClose)], [parseFloat(d.ThursdayOpen), parseFloat(d.ThursdayClose)], [parseFloat(d.FridayOpen), parseFloat(d.FridayClose)], [parseFloat(d.SaturdayOpen), parseFloat(d.SaturdayClose)]]
    }
}
// Import csv and map data to restaurant list
d3.csv("https://northbynorthwestern.github.io/restaurant-guide/RestaurantTimes.csv", rowConverter).then(function(data){
    restaurantList = data;
    console.log(hour)
    setMap(parseFloat(hour.toString() + "." + minute.toString()), day)
})

// Get current time and day
let currentTime = new Date();
let hour = currentTime.getHours();
let minute = currentTime.getMinutes();
let day = currentTime.getDay();
let weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Convert date to string for display on page
let dateToString = (inputHour, inputMinute, inputWeekday) => {
    let parsedMinute;
    let parsedWeekday = weekday[inputWeekday]
    if(inputMinute <= 9){
        parsedMinute = "0" + inputMinute
    }
    else{
        parsedMinute = inputMinute;
    }
    if(inputHour == 12){
        return(inputHour + ":" + parsedMinute + " p.m. on a " + parsedWeekday ) 
    }
    else if(inputHour == 0){
        return("12:" + parsedMinute + " a.m. on a " + parsedWeekday)
    }
    else if(inputHour < 12){
        return(inputHour + ":" + parsedMinute + " a.m. on a " + parsedWeekday)
    }
    else{
        return((inputHour - 12) + ":" + parsedMinute + " p.m. on a " + parsedWeekday)
    }
}

let setMap = (timeDecimal, selectDay) => {
    restaurantSelected = false;
    // Reset map and list on page
    layerGroup.clearLayers();
    document.getElementById("restaurant-list").innerHTML = ""


    for(let restaurant of restaurantList){
        let timeRange = restaurant.availability[selectDay];
        if(((timeDecimal >= timeRange[0] && timeDecimal <= timeRange[1]) || (timeRange[1] >= 24 && timeDecimal <= (timeRange[1] - 24))) && (timeRange[0] != timeRange[1])){

            // adds marker if selected time falls between a restaurant's open and close times
            let marker = L.marker([restaurant.XCoord, restaurant.YCoord]).addTo(layerGroup);
            marker.bindPopup(`<h3>${restaurant.name}</h3><p>${restaurant.address}</p><a href=${restaurant.website} target="_blank">Visit website</a></p></div>`)
            let newListItem = document.createElement("li");
            newListItem.innerHTML = `<div class = "restaurant-button"><h3 class=""restaurant-name">${restaurant.name}</h3></div> <div class="restaurant-details"><p>${restaurant.address}</p><p><a href=${restaurant.website} target="_blank">Visit website</a></p></div>`;
            // Scroll to marker when hovering over restaurant name on list
            newListItem.onclick = function(){
                if(restaurantSelected){
                    document.querySelector(".selected-restaurant").classList.toggle("selected-restaurant")
                }
   
                newListItem.classList.toggle("selected-restaurant")
                mymap.flyTo(L.latLng(restaurant.XCoord, restaurant.YCoord), 17)
                marker.openPopup();
                restaurantSelected = true;
            }
            // Reset zoom on mouse exit
            // newListItem.onmouseleave = function(){
            //     mymap.flyTo(L.latLng(restaurant.XCoord, restaurant.YCoord), 16, {
            //         animate: true,
            //         duration: 1.5
            //     })
            //     marker.closePopup();
            // }
            document.getElementById("restaurant-list").append(newListItem)
        }
    }
}
let getInputTime = () => {
    // Reset error alert and hide intro text on mobile
    d3.select("#error-alert").classed("hidden", true);
    d3.select("#article-dek-mobile").classed("hidden", true);
    d3.select("#article-disclaimer-mobile").classed("hidden", true)
    let setHour;
    // Retrieve user input as integers
    let hourInput = parseInt(document.getElementById("hourInput").value);
    console.log(hourInput);
    let minuteInput = parseInt(document.getElementById("minuteInput").value);
    console.log(minuteInput);
    let period = document.getElementById("period").value;
    console.log(period) 
    let weekdayInput = parseInt(document.getElementById("weekday").value)
    console.log(weekdayInput)
    if(isNaN(minuteInput) || minuteInput < 0 || minuteInput > 59){
        // Show error when user does not input a number or inputs a number outside the expected range
        d3.select("#error-alert").classed("hidden", false)
        return;
    }
    else if(hourInput == 12 && period == "AM"){
        setHour = 0;
    }
    else if(hourInput == 12 && period == "PM"){
        setHour = 12;
    }
    else if(period == "PM"){
        setHour = hourInput + 12;
        console.log(setHour)
    }
    else{
        setHour = hourInput;
    }
    document.getElementById("clockText").innerHTML = dateToString(setHour, minuteInput, weekdayInput)
    // Converts time to float where the decimals represent the minutes - e.g. 11:30 p.m. == 23.3, 5:00 a.m. == 5
    let finalTime = [parseFloat(setHour.toString() + "." + minuteInput.toString()), weekdayInput]
    setMap(finalTime[0], finalTime[1])
 
}
document.getElementById("submitForm").addEventListener("click", function(){getInputTime()})

document.getElementById("clockText").innerHTML = dateToString(hour, minute, day)

