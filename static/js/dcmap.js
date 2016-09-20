  var gmap = null;
  
  function initMap(){
    // initializing google maps
    gmap = new google.maps.Map(document.getElementById('gmap'),{
      zoom : 4,
      center : { lat: 24.361388, lng: 86.504824},
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
      }
    });
  }
  
$(document).ready(function(){
  

});