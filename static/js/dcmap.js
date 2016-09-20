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

function fetch_data_from_city(city){
  var data
  var url=$('#city_select').attr("action");
  $.post(url, city ,function(dc_data){
    var d_obj = JSON.parse(dc_data);
    console.log(d_obj);
    });
}

$(document).ready(function(){
  //Select dc from city
  $( "#city" ).on('change',function() {
    var citySelected = $('#city option:selected').text();
    localStorage.setItem("city",citySelected);
    fetch_data_from_city(citySelected);
  });

  // $('#city').autocomplete({
  //          lookup: data,
  //          onSelect: function (suggestion) {
  //              // alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
  //          }
  //      });

});