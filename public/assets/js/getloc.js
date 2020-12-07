var pathname=window.location.pathname;
pathname=pathname.substring(pathname.lastIndexOf('/')+1);
var lat,longi;
var finallat,finallongi;
if(window.navigator.geolocation){
	window.navigator.geolocation.getCurrentPosition(function(success,failure){
         if(success){
             lat=success.coords.latitude;
             longi=success.coords.longitude;
            }});
}
$.get("/returncoordinates/".concat(pathname),function(err,res){
    if(!err){
        finallat=res[0].lat;
        finallongi=res[0].longi;
    }

});
console.log(lat,longi);
console.log(finallat,finallongi);
button=document.getElementById("load");


button.addEventListener("onClick",function(){
/** 
 * Moves the map to display over Berlin
 *
 * @param  {H.Map} map      A HERE Map instance within the application
 */
function moveMapToBerlin(map){
    map.setCenter({lat:lat, lng:longi});
    map.setZoom(14);
  }
  
  /**
   * Boilerplate map initialization code starts below:
   */
  
  //Step 1: initialize communication with the platform
  // In your own code, replace variable window.apikey with your own apikey
  var platform = new H.service.Platform({
    apikey:'YLvlC4Bt5VHlCRIa4n--MKcuXeZzIZy02W8PflzrZcI'
  });
  var defaultLayers = platform.createDefaultLayers();
  
  //Step 2: initialize a map - this map is centered over Europe
  var map = new H.Map(document.getElementById('map'),
    defaultLayers.vector.normal.map,{
    center: {lat:50, lng:5},
    zoom: 4,
    pixelRatio: window.devicePixelRatio || 1
  });
  // Create the parameters for the routing request:
var routingParameters = {
    'routingMode': 'fast',
    'transportMode': 'car',
    // The start point of the route:
    'origin': `${lat.toString()},${longi.toString()}` ,
    // The end point of the route:
    'destination': `${finallat.toString()},${finallongi.toString()}` ,
    // Include the route shape in the response
    'return': 'polyline'
  };
  
  // Define a callback function to process the routing response:
  var onResult = function(result) {
    // ensure that at least one route was found
    console.log(result.routes);
    if (result.routes.length) {
      result.routes[0].sections.forEach((section) => {
           // Create a linestring to use as a point source for the route line
          let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
  
          // Create a polyline to display the route:
          let routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: 'blue', lineWidth: 3 }
          });
  
          // Create a marker for the start point:
          let startMarker = new H.map.Marker(section.departure.place.location);
  
          // Create a marker for the end point:
          let endMarker = new H.map.Marker(section.arrival.place.location);
  
          // Add the route polyline and the two markers to the map:
          map.addObjects([routeLine, startMarker, endMarker]);
  
          // Set the map's viewport to make the whole route visible:
          map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
      });
    }
  };
  
  // Get an instance of the routing service version 8:
  var router = platform.getRoutingService(null, 8);
  
  // Call calculateRoute() with the routing parameters,
  // the callback and an error callback function (called if a
  // communication error occurs):
  router.calculateRoute(routingParameters, onResult,
    function(error) {
      console.log(error.message);
    });
  
  // add a resize listener to make sure that the map occupies the whole container
  window.addEventListener('resize', () => map.getViewPort().resize());
  
  //Step 3: make the map interactive
  // MapEvents enables the event system
  // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
  var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  
  // Create the default UI components
  var ui = H.ui.UI.createDefault(map, defaultLayers);
  
  // Now use the map as required...
  window.onload = function () {
    moveMapToBerlin(map);
  }
})
