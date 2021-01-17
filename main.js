var mymap = L.map('map-one', {minZoom: 14, attributionControl: false}).setView([42.055984, -87.675171], 15);
// mymap.setMaxBounds(mymap.getBounds());
L.tileLayer('https://api.mapbox.com/styles/v1/dmdeloso/ckk0gkv9q1hoe17qrngmljsau/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZG1kZWxvc28iLCJhIjoiY2trMGZ6aXJhMDVqdDJvbnI4YzM5MHRraiJ9.nOwnc18LqvUNErSlg4N0AA').addTo(mymap);
var layerGroup = L.layerGroup().addTo(mymap);
let restaurantList;

let rowConverter = function(d){
    return{
        name: d.RestaurantName,
        XCoord: parseFloat(d.XCoord),
        YCoord: parseFloat(d.YCoord),
        availability: [[parseFloat(d.SundayOpen), parseFloat(d.SundayClose)], [parseFloat(d.MondayOpen), parseFloat(d.MondayClose)], [parseFloat(d.TuesdayOpen), parseFloat(d.TuesdayClose)], [parseFloat(d.WednesdayOpen), parseFloat(d.WednesdayClose)], [parseFloat(d.ThursdayOpen), parseFloat(d.ThursdayClose)], [parseFloat(d.FridayOpen), parseFloat(d.FridayClose)], [parseFloat(d.SaturdayOpen), parseFloat(d.SaturdayClose)]]
    }
}
d3.csv("https://northbynorthwestern.github.io/restaurant-guide/RestaurantTimes.csv", rowConverter).then(function(data){
    restaurantList = data;
    console.log(hour)
    setMap(parseFloat(hour.toString() + "." + minute.toString()), day)
})
let currentTime = new Date();
let hour = currentTime.getHours();
let minute = currentTime.getMinutes();
let day = currentTime.getDay();
let weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
    layerGroup.clearLayers();
    document.getElementById("restaurant-list").innerHTML = ""
    for(let restaurant of restaurantList){
        let timeRange = restaurant.availability[selectDay];
        if(timeDecimal >= timeRange[0] && timeDecimal <= timeRange[1]){
            let marker = L.marker([restaurant.XCoord, restaurant.YCoord]).addTo(layerGroup);
            marker.bindPopup(restaurant.name)
            let newListItem = document.createElement("li");
            newListItem.innerHTML = restaurant.name;
            newListItem.onmouseover = function(){
                console.log(restaurant.name)
                mymap.flyTo(L.latLng(restaurant.XCoord, restaurant.YCoord), 16)
            }
            newListItem.onmouseleave = function(){
                mymap.flyTo(L.latLng(restaurant.XCoord, restaurant.YCoord), 15, {
                    animate: true,
                    duration: 1.5
                })
            }
            document.getElementById("restaurant-list").append(newListItem)
        }
    }
}
let getInputTime = () => {
    d3.select("#error-alert").classed("hidden", true)
    
    let setHour;
    let hourInput = parseInt(document.getElementById("hourInput").value);
    console.log(hourInput);
    let minuteInput = parseInt(document.getElementById("minuteInput").value);
    console.log(minuteInput);
    let period = document.getElementById("period").value;
    console.log(period) 
    let weekdayInput = parseInt(document.getElementById("weekday").value)
    console.log(weekdayInput)
    if(isNaN(minuteInput)){
        d3.select("#error-alert").classed("hidden", false)
        return;
    }
    else if(minuteInput < 0 || minuteInput > 59){
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
    let finalTime = [parseFloat(setHour.toString() + "." + minuteInput.toString()), weekdayInput]
    setMap(finalTime[0], finalTime[1])
 
}
document.getElementById("submitForm").addEventListener("click", function(){getInputTime()})

document.getElementById("clockText").innerHTML = dateToString(hour, minute, day)

