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
  gmap.controls[google.maps.ControlPosition.TOP_RIGHT].push(coordD);
  var selecters = (document.getElementById('selecters'));
  gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(selecters);
  var legends = (document.getElementById('legends'));
  gmap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legends);
  var flashMessages = (document.getElementById('flashMessages'));
  gmap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(flashMessages);  

  //mouse over coordinate event
  gmap.addListener('mousemove',function(event){
  coordD.innerHTML =  'Lat: ' + event.latLng.lat() + '<br/> Lng: ' + event.latLng.lng(); 
  });

  document.getElementById('gmap').style.height = (window.innerHeight - 100) +'px'; 

  //Loading the previous value for the state
  if (localStorage.getItem('city')){
    var stateSelected = localStorage.getItem("city");
    $('#city').val(stateSelected);
    $("#city").change(); 
  }

  $("#flashMessages").hide();
}

function load_marker(data){
  locality_data = data[1];
  dc_data = data[0];
  // Adding marker for each locality in data
    for (i = 0; i < locality_data.length; i++) {
      var Rec_id = i //data[i]._id;
      var status = locality_data[i].status;
      var position = { lat: Number(locality_data[i].lat), lng: Number(locality_data[i].long) };
      var marker_color;
      if(Number(status)==0){ marker_color = 'http://mw1.google.com/crisisresponse/icons/teal_dot.png'; }
      else if(Number(status)==1){ marker_color = 'http://www.geocodezip.com/mapIcons/small_yellow_dot.png'; }
      else if(Number(status)==2){ marker_color = 'http://www.mapdent.com/maps/icons/circle/green.png'; } 
      if(Number(locality_data[i].lat)>1){
      addLocalityMarker(position,marker_color,Rec_id); }
    }
    // markerCluster = new MarkerClusterer(gmap, Localitymarkers, {imagePath: 'static/images/m'});
  // Adding marker for each DC in data
    for (i = 0; i < dc_data.length; i++) {
      var Rec_id = i //dc_data[i]._id;
      var position = {lat: Number(dc_data[i].latitude), lng: Number(dc_data[i].longitude) };
      var marker_color = 'http://www.aialosangeles.org/images/map-dot.png';
      if(Number(dc_data[i].latitude)>1){
      addDCMarker(position,marker_color,Rec_id); }
    }
}

function addLocalityMarker(position,icon,rec_id){
  var mdc = ""; var rdc = "";
  for (var i = dc_data.length - 1; i >= 0; i--) {
      if(dc_data[i]._id == locality_data[rec_id].mdc){ mdc =dc_data[i].value}
      if(dc_data[i]._id == locality_data[rec_id].rdc){ rdc =dc_data[i].value}
  }
  marker = new google.maps.Marker({
      position: position,
      icon: icon,
      id: rec_id,
      title: "Name: " + locality_data[rec_id].locality + "\nMDC: " + mdc + "\nRDC: " + rdc,
      map: gmap
      });
  Localitymarkers[rec_id]=marker; 
  marker.addListener('click', function() {
          gmap.panTo(this.position);
          gmap.setZoom(14);
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
  DCmarkers[rec_id]=marker;  
  marker.addListener('click', function() {
          gmap.panTo(this.position);
          gmap.setZoom(14);
          OnclickDCMarker(this.id);
      });  
}

function OnclickDCMarker(rec_id){
          DeletePolyLines();
          DeletePolygones();
          var count= 0 ;
          DC2markerArray = [];
          RDC2markerArray = [];
          //Create a new instance.
          var DC_convexHull = new ConvexHullGrahamScan();
          var RDC_convexHull = new ConvexHullGrahamScan();
          for (var j = 0; j <= locality_data.length-1; j++) {
            if((dc_data[rec_id]._id == locality_data[j].mdc | dc_data[rec_id]._id == locality_data[j].rdc) & Number(locality_data[j].lat)>1 ){
              //add points (needs to be done for each point, a foreach loop on the input array can be used.)
              if(dc_data[rec_id]._id == locality_data[j].mdc & Number(locality_data[j].lat) != "" ){
                DC_convexHull.addPoint(Number(locality_data[j].lat),Number(locality_data[j].long));
              }
              if(dc_data[rec_id]._id == locality_data[j].rdc & Number(locality_data[j].lat) != "" ){
                RDC_convexHull.addPoint(Number(locality_data[j].lat),Number(locality_data[j].long));
              }
              DC2markerArray[count] = j
              count = count + 1;
            }
          }
          var DC_hullPoints = DC_convexHull.getHull();
          var RDC_hullPoints = RDC_convexHull.getHull();
          // convert each value to number in hullpoint array
          var DC_result_array = [];
          var RDC_result_array = [];
          if(DC_hullPoints.length > 2){
            for (var i = DC_hullPoints.length - 1; i >= 0; i--) {
                  DC_result_array[i] = new google.maps.LatLng(Number(DC_hullPoints[i].x),Number(DC_hullPoints[i].y));
            }
          }
          if(RDC_hullPoints.length > 2){  
            for (var i = RDC_hullPoints.length - 1; i >= 0; i--) {
                  RDC_result_array[i] = new google.maps.LatLng(Number(RDC_hullPoints[i].x),Number(RDC_hullPoints[i].y));
            }
          }
          DC2markerArray[count] = rec_id;
          if(DC_result_array.length > 0)
            { CreatePolygone(DC_result_array,gmap,color='#FF0000',1); }
          if(RDC_result_array.length > 0)
            { CreatePolygone(RDC_result_array,gmap,color='#00FF00',2); }
          if(!DC_result_array.length > 0 & RDC_result_array.length > 0 ) 
            { ShowAlert('No Mapped Locality for selected DC'); }
          else if(DC_result_array.length > 0 & !RDC_result_array.length > 0) 
            { ShowAlert('No Suggested Locality for selected DC'); }
          else if(!DC_result_array.length > 0 & !RDC_result_array.length > 0)
            { ShowAlert('No Mapped & Suggested Locality for selected DC'); }
}

function OnclickLocalityMarker(rec_id){
          DeletePolyLines();
          DeletePolygones();
          if(locality_data[rec_id].status == 2){
            for (var j = 0; j <= dc_data.length-1; j++) {
              if(locality_data[rec_id].mdc == dc_data[j]._id){
                Coordinates = [
                  {lat:Number(locality_data[rec_id].lat),lng:Number(locality_data[rec_id].long)},
                  {lat:Number(dc_data[j].latitude) , lng:Number(dc_data[j].longitude)}
                ];
                CreatePolyLines(gmap, Coordinates,j);
              }
            }
          }
}

function deleteMarker(){
  DeletePolyLines();
  DeletePolygones();
  for (var i = 0; i < Localitymarkers.length; i++) {
          if(Localitymarkers[i]){ Localitymarkers[i].setMap(null); }
        }
  // if(markerCluster){markerCluster.clearMarkers();}
  for (var i = 0; i < DCmarkers.length; i++) {
          if(DCmarkers[i]){ DCmarkers[i].setMap(null); }
        }
  Localitymarkers = [];
  DCmarkers = [];
}

function CreatePolyLines(map,Coordinates){
   MapPolyLine = new google.maps.Polyline({
          path: Coordinates,
          geodesic: true,
          strokeColor: '#333333',
          strokeOpacity: 1.0,
          strokeWeight: 1
        });
  polylineObj[polylineCount] = MapPolyLine
  polylineCount = polylineCount + 1;
  MapPolyLine.setMap(map);
}
function DeletePolyLines(){
  for (var i = polylineCount - 1; i >= 0; i--) {
    polylineObj[i].setMap(null);
  }
}

function CreatePolygone(PolygonCoordinate,map,color,stroke){
// Construct the polygon.
  MapPolygon = new google.maps.Polygon({
    paths: PolygonCoordinate,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: stroke,
    fillColor: color,
    fillOpacity: 0.1
  });
  polygoneObj[polygoneCount] = MapPolygon
  polygoneCount = polygoneCount + 1;
  MapPolygon.setMap(map);
  HighlightConnectedMarker();
} 

//delete all previous polyline
function DeletePolygones(){
  for (var k = polygoneCount - 1; k >= 0; k--) {
    polygoneObj[k].setMap(null);
  }
  ChangeMarkerColor();
}

//change color of those marker who fall in ploygon
function HighlightConnectedMarker(){
      for(i = 0; i <= DC2markerArray.length - 1; i++){
        j=DC2markerArray[i];
        // if(locality_data[j].status == 2 ){
          if(locality_data[j].mdc == locality_data[j].rdc){
            if(Localitymarkers[j]){ Localitymarkers[j].setIcon('http://www.mapdent.com/maps/icons/circle/blue.png'); }
          }
          else if(locality_data[j].mdc != locality_data[j].rdc){
            k = DC2markerArray[DC2markerArray.length - 1];
            if(dc_data[k]._id == locality_data[j].mdc){
                if(Localitymarkers[j]){ Localitymarkers[j].setIcon('http://www.mapdent.com/maps/icons/circle/brown.png'); }
            }
            else{
                if(Localitymarkers[j]){ Localitymarkers[j].setIcon('http://www.mapdent.com/maps/icons/circle/magenta.png'); }
            }
          }
        // }
      }
      j=DC2markerArray[DC2markerArray.length - 1];
      DCmarkers[j].setIcon('https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png'); 
}

//change coolor back to normal for all marker
function ChangeMarkerColor(){
  for (var i = 0; i < DC2markerArray.length - 1 ; i++) {
    j=DC2markerArray[i];
    if(j>=0){
      var status = locality_data[j].status;
      if(Number(status)==0){ Localitymarkers[j].setIcon('http://mw1.google.com/crisisresponse/icons/teal_dot.png'); }
      else if(Number(status)==1){ Localitymarkers[j].setIcon('http://www.geocodezip.com/mapIcons/small_yellow_dot.png'); }
      else if(Number(status)==2){ Localitymarkers[j].setIcon('http://www.mapdent.com/maps/icons/circle/green.png'); } 
      // Localitymarkers[j].setIcon('http://www.mapdent.com/maps/icons/circle/green.png');
    }
  }
  if(DC2markerArray.length-1 > 0){
    j=DC2markerArray[DC2markerArray.length - 1];
    if(j>=0){
      DCmarkers[j].setIcon('http://www.aialosangeles.org/images/map-dot.png');
    }
  }
}

function ZoomInto(DCname,value){
  var position;
  for (var i = dc_data.length - 1; i >= 0; i--) {
    if(dc_data[i].value == DCname){
      position = {lat: Number(dc_data[i].latitude),lng: Number(dc_data[i].longitude)};
    }
  }
  if(position){
    gmap.setZoom(value);
    gmap.panTo(position);
  }  
}

// convex hull algo for make polygon
function ConvexHullGrahamScan(){this.anchorPoint=void 0,this.reverse=!1,this.points=[]}ConvexHullGrahamScan.prototype={constructor:ConvexHullGrahamScan,Point:function(n,t){this.x=n,this.y=t},_findPolarAngle:function(n,t){var i,o,h=57.295779513082;if(!n||!t)return 0;if(i=t.x-n.x,o=t.y-n.y,0==i&&0==o)return 0;var r=Math.atan2(o,i)*h;return this.reverse?0>=r&&(r+=360):r>=0&&(r+=360),r},addPoint:function(n,t){return void 0===this.anchorPoint?void(this.anchorPoint=new this.Point(n,t)):this.anchorPoint.y>t&&this.anchorPoint.x>n||this.anchorPoint.y===t&&this.anchorPoint.x>n||this.anchorPoint.y>t&&this.anchorPoint.x===n?(this.points.push(new this.Point(this.anchorPoint.x,this.anchorPoint.y)),void(this.anchorPoint=new this.Point(n,t))):void this.points.push(new this.Point(n,t))},_sortPoints:function(){var n=this;return this.points.sort(function(t,i){var o=n._findPolarAngle(n.anchorPoint,t),h=n._findPolarAngle(n.anchorPoint,i);return h>o?-1:o>h?1:0})},_checkPoints:function(n,t,i){var o,h=this._findPolarAngle(n,t),r=this._findPolarAngle(n,i);return h>r?(o=h-r,!(o>180)):r>h?(o=r-h,o>180):!0},getHull:function(){var n,t,i=[];if(this.reverse=this.points.every(function(n){return n.x<0&&n.y<0}),n=this._sortPoints(),t=n.length,3>t)return n.unshift(this.anchorPoint),n;for(i.push(n.shift(),n.shift());;){var o,h,r;if(i.push(n.shift()),o=i[i.length-3],h=i[i.length-2],r=i[i.length-1],this._checkPoints(o,h,r)&&i.splice(i.length-2,1),0==n.length){if(t==i.length){var e=this.anchorPoint;return i=i.filter(function(n){return!!n}),i.some(function(n){return n.x==e.x&&n.y==e.y})||i.unshift(this.anchorPoint),i}n=i,t=n.length,i=[],i.push(n.shift(),n.shift())}}}},"function"==typeof define&&define.amd&&define(function(){return ConvexHullGrahamScan}),"undefined"!=typeof module&&(module.exports=ConvexHullGrahamScan);

function ShowAlert(msg){
  $("#flashMessages").hide();
  document.getElementById('alertMessage').innerHTML = msg;
  console.log(msg);
  $("#flashMessages").alert();
  $("#flashMessages").fadeTo(10000, 500).slideUp(500, function(){
     $("#flashMessages").slideUp(500);
      });
}

$(document).ready(function(){

  //Select dc from city
  $( "#city" ).on('change',function() {
    var citySelected = $('#city option:selected').text();
    localStorage.setItem("city",citySelected);
    var url=$('#city_select').attr("action");
    $.post(url, citySelected ,function(response_data){
      var data = JSON.parse(response_data);
      $('#dc').autocomplete({
               lookup: data[0],
               onSelect: function (suggestion) {
                   // console.log('You selected: ' + suggestion.value + ', ' + suggestion._id);
                  ZoomInto(suggestion.value,14);
                  for (var i = dc_data.length - 1; i >= 0; i--) {
                    if(suggestion.value == dc_data[i].value){
                      OnclickDCMarker(i);
                    }
                  }
               }
      });
      deleteMarker();
      load_marker(data);
      ZoomInto(dc_data[0].value,10);
    });
    $('#dc').val("");
  });
  $( window ).resize(function() {
    document.getElementById('gmap').style.height = (window.innerHeight - 82) +'px'; 
  });
});

