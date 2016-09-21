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

  //Select dc from city
  $( "#city" ).on('change',function() {
    var citySelected = $('#city option:selected').text();
    
    localStorage.setItem("city",citySelected);
    
    var url=$('#city_select').attr("action");
    $.post(url, citySelected ,function(response_data){
      console.log("Antriksh");
      var dc_data = JSON.parse(response_data);
      $('#dc').autocomplete({
               lookup: dc_data[0],
               onSelect: function (suggestion) {
                   console.log('You selected: ' + suggestion.value + ', ' + suggestion._id);
               }
      });
    });
  });


});