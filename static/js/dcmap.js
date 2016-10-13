var gmap = null;
var locality_data,dc_data;
var marker;
var Localitymarkers = [];
var DCmarkers = [];
var markerCluster;
var DC2markerArray = [];
var RDC2markerArray = [];
var MapPolyLine;
var polylineCount = 0;
var polylineObj = [];
var MapPolygon;
var polygoneCount = 0;
var polygoneObj = [];

var custom_mar = {
   path: 'M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z',
   strokeColor: '#F11',
   fillColor: '#F22',
   fillOpacity: 1,
   strokeWeight: 1,
   scale: 0.5
 };
var custom_mar2 = {
   path: 'M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z',
   strokeColor: '#0F0',
   fillColor: '#0F0',
   fillOpacity: 1,
   strokeWeight: 1,
   scale: 2
 };


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

  //insert elements in google maps
  var coordD = (document.getElementById('coord'));
  gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(coordD);
  var selecters = (document.getElementById('selecters'));
  gmap.controls[google.maps.ControlPosition.TOP_RIGHT].push(selecters);
  // var dcData = (document.getElementById('dcData'));
  // gmap.controls[google.maps.ControlPosition.RIGHT_TOP].push(dcData);
  var legends = (document.getElementById('legends'));
  gmap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legends);
  var flashMessages = (document.getElementById('flashMessages'));
  gmap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(flashMessages);  

  //mouse hover coordinate event
  gmap.addListener('mousemove',function(event){
  coordD.innerHTML =  'Lat: ' + event.latLng.lat() + '<br/> Lng: ' + event.latLng.lng(); 
  });

  // on load get window height and set to gmap div
  document.getElementById('gmap').style.height = (window.innerHeight - 100) +'px'; 

  //Loading the previous value for the city
  if (localStorage.getItem('city')){
    var stateSelected = localStorage.getItem("city");
    $('#city').val(stateSelected);
    $("#city").change(); 
  }

  // on load hide flash msg div
  $("#flashMessages").hide();
  
  // on load hide dc data table div
  $("#dcData").hide();
}

// function to load markers for given data
function load_marker(data){
  // load dc and locality data to two list
  locality_data = data[1];
  dc_data = data[0];
    
    // Adding marker for each locality in data
    for (i = 0; i < locality_data.length; i++) {
      var Rec_id = i //data[i]._id;
      var status = locality_data[i].status;
      var position = { lat: Number(locality_data[i].lat), lng: Number(locality_data[i].long) };
      var marker_color;
      if(Number(status)==0){ marker_color = 'images/teal-dot.png'; }
      else if(Number(status)==1){ marker_color = 'images/yellow-dot.png'; }
      else if(Number(status)==2){ marker_color = 'images/green-dot.png'; } 
      if(Number(locality_data[i].lat)>1){
      addLocalityMarker(position,marker_color,Rec_id); }
    }
    // deprecated method for cluster marker
    // markerCluster = new MarkerClusterer(gmap, Localitymarkers, {imagePath: '/static/images/m'});

    // Adding marker for each DC in data
    for (i = 0; i < dc_data.length; i++) {
      var Rec_id = i //dc_data[i]._id;
      var position = {lat: Number(dc_data[i].latitude), lng: Number(dc_data[i].longitude) };
      var marker_color = 'images/red-dot.png';
      if(Number(dc_data[i].latitude)>1){
      addDCMarker(position,marker_color,Rec_id); }
    }
}

// add a marker to given position of given color
function addLocalityMarker(position,icon,rec_id){
  // set null to mdc & rdc name for a locality
  var mdc = ""; var rdc = "";
  
  // get mdc & rdc name for a locality from dc_data list
  for (var i = dc_data.length - 1; i >= 0; i--) {
      if(dc_data[i]._id == locality_data[rec_id].mdc)
        { mdc =dc_data[i].value}
      if(dc_data[i]._id == locality_data[rec_id].rdc)
        { rdc =dc_data[i].value}
  }

  marker = new google.maps.Marker({
      position: position,
      icon: icon,
      id: rec_id,
      title: "Name: " + locality_data[rec_id].locality + "\nMDC: " + mdc + "\nRDC: " + rdc,
      map: gmap
      });
  
  // add marker object to locality marker array for further use
  Localitymarkers[rec_id]=marker; 

  // add on click listner to marker
  marker.addListener('click', function() {
          gmap.panTo(this.position);
          gmap.setZoom(14);
          // call a function for further process
          OnclickLocalityMarker(this.id);
      });  
}

function addDCMarker(position,icon,rec_id){
  
  marker = new google.maps.Marker({
      position: position,
      icon: icon,
      id: rec_id,
      title: "Name: " + dc_data[rec_id].value,
      map: gmap
      });
  
  // add marker object to dc marker array for further use
  DCmarkers[rec_id]=marker;  

  // add on click listner to amrker
  marker.addListener('click', function() {
          gmap.panTo(this.position);
          gmap.setZoom(14);
          //calling a function for further process
          OnclickDCMarker(this.id);
      });  
}

// onClick locality marker create polyline & delete polygon and polyline
function OnclickLocalityMarker(rec_id){
  
  DeletePolyLines();
  DeletePolygones();
  
  // for only mapped locality (status 2 for mapped locality)
  if(locality_data[rec_id].status == 2){
    for (var j = 0; j <= dc_data.length-1; j++) {
      // if mdc id of a clicked locality match to dc id
      if(locality_data[rec_id].mdc == dc_data[j]._id){
        // cordinate for mdc and locality to create polyine
        Coordinates = [
          {lat:Number(locality_data[rec_id].lat),lng:Number(locality_data[rec_id].long)},
          {lat:Number(dc_data[j].latitude) , lng:Number(dc_data[j].longitude)}
        ];
        CreatePolyLines(gmap, Coordinates,j);
        break;
      }
    }
  }
}

// onClick of a dc marker create polygone & delete polygon and polyline
function OnclickDCMarker(rec_id){
  
  DeletePolyLines();
  DeletePolygones();
  var count= 0 ;
  DC2markerArray = [];
  RDC2markerArray = [];

  //Create a new instance for hull.
  var DC_convexHull = new ConvexHullGrahamScan();
  var RDC_convexHull = new ConvexHullGrahamScan();

  for (var j = 0; j <= locality_data.length-1; j++) {
    if((dc_data[rec_id]._id == locality_data[j].mdc | dc_data[rec_id]._id == locality_data[j].rdc) & Number(locality_data[j].lat)>1 ){
      
      // add point for mdc convex hull
      if(dc_data[rec_id]._id == locality_data[j].mdc & Number(locality_data[j].lat) != "" ){
        DC_convexHull.addPoint(Number(locality_data[j].lat),Number(locality_data[j].long));
      }
      // add point for rdc convex hull
      if(dc_data[rec_id]._id == locality_data[j].rdc & Number(locality_data[j].lat) != "" ){
        RDC_convexHull.addPoint(Number(locality_data[j].lat),Number(locality_data[j].long));
      }
      
      // adding each locality to dc2marker array for further color change andd etc.
      DC2markerArray[count] = j
      count = count + 1;
    }
  }
  
  //get hull points for each hull
  var MDC_hullPoints = DC_convexHull.getHull();
  var RDC_hullPoints = RDC_convexHull.getHull();

  var MDC_result_array = [];
  var RDC_result_array = [];

  // convert each value to number in mdc hullpoint array
  if(MDC_hullPoints.length > 2){
    for (var i = MDC_hullPoints.length - 1; i >= 0; i--) {
          MDC_result_array[i] = new google.maps.LatLng(Number(MDC_hullPoints[i].x),Number(MDC_hullPoints[i].y));
    }
  }
  // convert each value to number in rdc hullpoint array
  if(RDC_hullPoints.length > 2){  
    for (var i = RDC_hullPoints.length - 1; i >= 0; i--) {
          RDC_result_array[i] = new google.maps.LatLng(Number(RDC_hullPoints[i].x),Number(RDC_hullPoints[i].y));
    }
  }

  // add dc rec_id to dc2marker array
  DC2markerArray[count] = rec_id;

  // call create polygone function on basis of mdc & rdc convex hull array
  if(MDC_result_array.length > 0)
    { CreatePolygone(MDC_result_array,gmap,color='#FF0000',1); }
  if(RDC_result_array.length > 0)
    { CreatePolygone(RDC_result_array,gmap,color='#00FF00',2); }

  // alert for empty array of mdc or rdc
  if(!MDC_result_array.length > 0 & RDC_result_array.length > 0 ) 
    { ShowAlert('No Mapped Locality for selected DC'); }
  else if(MDC_result_array.length > 0 & !RDC_result_array.length > 0) 
    { ShowAlert('No Suggested Locality for selected DC'); }
  else if(!MDC_result_array.length > 0 & !RDC_result_array.length > 0)
    { ShowAlert('No Mapped & Suggested Locality for selected DC'); }
}

// delete all marker
function deleteMarker(){
  
  DeletePolyLines();
  DeletePolygones();

  // delete all marker from locality marker array 
  for (var i = 0; i < Localitymarkers.length; i++) {
      if(Localitymarkers[i])
        { Localitymarkers[i].setMap(null); }
  }
  // delete all marker from dc marker array
  for (var i = 0; i < DCmarkers.length; i++) {
      if(DCmarkers[i])
        { DCmarkers[i].setMap(null); }
  }

  // deprecated funcationality of marker cluster
  // clear marker cluster object 
  // if(markerCluster)
  // {markerCluster.clearMarkers();}

  // set null to both marker array after deletion of marker from map
  Localitymarkers = [];
  DCmarkers = [];
}

// create polyline foor given coordinates
function CreatePolyLines(map,Coordinates){
  
  MapPolyLine = new google.maps.Polyline({
          path: Coordinates,
          geodesic: true,
          strokeColor: '#333333',
          strokeOpacity: 1.0,
          strokeWeight: 1
        });
  MapPolyLine.setMap(map);
  
  // add polyline object to array for further operation on object
  polylineObj[polylineCount] = MapPolyLine
  polylineCount = polylineCount + 1;
}

// create polygone for given coordinates array
function CreatePolygone(PolygonCoordinate,map,color,stroke){
  
  MapPolygon = new google.maps.Polygon({
    paths: PolygonCoordinate,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: stroke,
    fillColor: color,
    fillOpacity: 0.1
  });
  MapPolygon.setMap(map);

  // add polygone object to array for further operation on object
  polygoneObj[polygoneCount] = MapPolygon
  polygoneCount = polygoneCount + 1;
  
  // change all marker color connected to selected dc
  HighlightConnectedMarker();
} 

// get all polyline from polylineObj and delete from map
function DeletePolyLines(){
  
  for (var i = polylineCount - 1; i >= 0; i--) {
    polylineObj[i].setMap(null);
  }

  //reset array and count
  polylineObj = [];
  polylineCount = 0;
}

// get all polygone from polygonObj and delete from map
function DeletePolygones(){
  
  for (var k = polygoneCount - 1; k >= 0; k--) {
    polygoneObj[k].setMap(null);
  }
  
  // reset array after deletion of polygone
  polygoneObj = [];
  polygoneCount = 0;

  // change color back to normal for marker
  ChangeMarkerColor();
}

//change color of marker connected to selected dc
function HighlightConnectedMarker(){
  // change color of locality 
  for(i = 0; i <= DC2markerArray.length - 1; i++){
    j=DC2markerArray[i];
    // if(locality_data[j].status == 2 ){    // for only mapped dc
    if(locality_data[j].mdc == locality_data[j].rdc){
      if(Localitymarkers[j]){ Localitymarkers[j].setIcon('images/blue-dot.png'); }
    }
    else if(locality_data[j].mdc != locality_data[j].rdc){
      k = DC2markerArray[DC2markerArray.length - 1];
      if(dc_data[k]._id == locality_data[j].mdc){
          if(Localitymarkers[j]){ Localitymarkers[j].setIcon('images/brown-dot.png'); }
      }
      else{
          if(Localitymarkers[j]){ Localitymarkers[j].setIcon('images/magenta-dot.png'); }
      }
    }
    // }
  }
  // change color of selected dc marker
  j=DC2markerArray[DC2markerArray.length - 1];
    DCmarkers[j].setIcon('images/marker-red.png'); 
}

//change color back to normal for all marker
function ChangeMarkerColor(){
  // change color for locality 
  for (var i = 0; i < DC2markerArray.length - 1 ; i++) {
    j=DC2markerArray[i];
    if(j>=0){
      var status = locality_data[j].status;
      if(Number(status)==0){ Localitymarkers[j].setIcon('images/teal-dot.png'); }
      else if(Number(status)==1){ Localitymarkers[j].setIcon('images/yellow-dot.png'); }
      else if(Number(status)==2){ Localitymarkers[j].setIcon('images/green-dot.png'); } 
    }
  }
  // change color of dc
  if(DC2markerArray.length-1 > 0){
    j=DC2markerArray[DC2markerArray.length - 1];
    if(j>=0){
      DCmarkers[j].setIcon('images/red-dot.png');
    }
  }

  // reset array after process
  DC2markerArray = [];
}

// zoom into map for selected city or dc
function ZoomInto(DCname,value){
  
  var position;
  for (var i = dc_data.length - 1; i >= 0; i--) {
    if(dc_data[i].value == DCname){
      // get postion of selected dc
      position = {lat: Number(dc_data[i].latitude),lng: Number(dc_data[i].longitude)};
      break;
    }
  }

  // set zoom on selected lat long
  if(position){
    gmap.setZoom(value);
    gmap.panTo(position);
  }  
}
// zoom into selected locality
function ZoomIntoLocality(locality_name,value){
  
  var position;
  for (var i = locality_data.length - 1; i >= 0; i--) {
    if(locality_data[i].value == locality_name){
      // get postion of selected dc
      position = {lat: Number(locality_data[i].lat),lng: Number(locality_data[i].long)};
      break;
    }
  }

  // set zoom on selected lat long
  if(position){
    gmap.setZoom(value);
    gmap.panTo(position);
  }  
}

// convex hull algo for create polygon
function ConvexHullGrahamScan(){this.anchorPoint=void 0,this.reverse=!1,this.points=[]}ConvexHullGrahamScan.prototype={constructor:ConvexHullGrahamScan,Point:function(n,t){this.x=n,this.y=t},_findPolarAngle:function(n,t){var i,o,h=57.295779513082;if(!n||!t)return 0;if(i=t.x-n.x,o=t.y-n.y,0==i&&0==o)return 0;var r=Math.atan2(o,i)*h;return this.reverse?0>=r&&(r+=360):r>=0&&(r+=360),r},addPoint:function(n,t){return void 0===this.anchorPoint?void(this.anchorPoint=new this.Point(n,t)):this.anchorPoint.y>t&&this.anchorPoint.x>n||this.anchorPoint.y===t&&this.anchorPoint.x>n||this.anchorPoint.y>t&&this.anchorPoint.x===n?(this.points.push(new this.Point(this.anchorPoint.x,this.anchorPoint.y)),void(this.anchorPoint=new this.Point(n,t))):void this.points.push(new this.Point(n,t))},_sortPoints:function(){var n=this;return this.points.sort(function(t,i){var o=n._findPolarAngle(n.anchorPoint,t),h=n._findPolarAngle(n.anchorPoint,i);return h>o?-1:o>h?1:0})},_checkPoints:function(n,t,i){var o,h=this._findPolarAngle(n,t),r=this._findPolarAngle(n,i);return h>r?(o=h-r,!(o>180)):r>h?(o=r-h,o>180):!0},getHull:function(){var n,t,i=[];if(this.reverse=this.points.every(function(n){return n.x<0&&n.y<0}),n=this._sortPoints(),t=n.length,3>t)return n.unshift(this.anchorPoint),n;for(i.push(n.shift(),n.shift());;){var o,h,r;if(i.push(n.shift()),o=i[i.length-3],h=i[i.length-2],r=i[i.length-1],this._checkPoints(o,h,r)&&i.splice(i.length-2,1),0==n.length){if(t==i.length){var e=this.anchorPoint;return i=i.filter(function(n){return!!n}),i.some(function(n){return n.x==e.x&&n.y==e.y})||i.unshift(this.anchorPoint),i}n=i,t=n.length,i=[],i.push(n.shift(),n.shift())}}}},"function"==typeof define&&define.amd&&define(function(){return ConvexHullGrahamScan}),"undefined"!=typeof module&&(module.exports=ConvexHullGrahamScan);

// show DC table on map
function ShowDcTable(msg){
  // on load hide dc data table div
  $("#dcData").hide();
  //get table variable
  var Dctable = $('#dcDataTable').DataTable();
  // clear all row
  Dctable.clear().draw();
  //set data into table
  for (var i = dc_data.length - 1; i >= 0; i--) {
    Dctable.row.add([ dc_data[i].value ]).draw();
  }
  // show Dc table window
  $("#dcData").show();
}

// show alert on map
function ShowAlert(msg){
  // hide older alert window
  $("#flashMessages").hide();
  //set alert msg
  document.getElementById('alertMessage').innerHTML = msg;
  // show alert window
  $("#flashMessages").alert();
  // close alert window after 10 seconds
  $("#flashMessages").fadeTo(10000, 500).slideUp(500, function(){
     $("#flashMessages").slideUp(500);
      });
}

$(document).ready(function(){

  //Select dc from city
  $( "#city" ).on('change',function() {
    //get city name
    var citySelected = $('#city option:selected').text();
    //set to local storage
    localStorage.setItem("city",citySelected);
    //get url for city_select tag
    var url=$('#city_select').attr("action");
    // post city name to url and get response from url
    $.post(url, citySelected ,function(response_data){
      // get response data (dc and locality)
      var data = JSON.parse(response_data);
      $('#locality').autocomplete({
               lookup: data[1],
               onSelect: function (suggestion) {
                   // console.log('You selected: ' + suggestion.value + ', ' + suggestion._id);
                  ZoomIntoLocality(suggestion.value,19);
                  // for (var i = dc_data.length - 1; i >= 0; i--) {
                  //   if(suggestion.value == dc_data[i].value){
                  //     OnclickDCMarker(i);
                  //   }
                  // }
               }
      });
      // delete previous marker, load new marker and zoom into for selected city
      deleteMarker();
      load_marker(data);
      ZoomInto(dc_data[0].value,10);
      ShowDcTable();
    });
    // clear older value of dc
    $('#dc').val("");
  });
  //resize window 
  $( window ).resize(function() {
    document.getElementById('gmap').style.height = (window.innerHeight - 82) +'px'; 
  });

  // data table
  $('#dcDataTable').DataTable({
    info:false,
    scrollY: '45vh',
    // scrollCollapse: true,
    paging:false,
    language: {
        search: "_INPUT_",
        searchPlaceholder: "Search DC"
    }
  });
  //data table on click
  $('#dcDataTable').on( 'click', 'tr', function () {
    var dataTable = $('#dcDataTable').DataTable();
    selectedDc = dataTable.row( this ).data();
    ZoomInto(selectedDc,14);
    for (var i = dc_data.length - 1; i >= 0; i--) {
      if(selectedDc == dc_data[i].value){
        OnclickDCMarker(i);
      }
    }
  });
});

