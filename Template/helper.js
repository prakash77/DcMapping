var map;
var data = {{data}};
var marker;
var markers = [];
var DC2markerArray = [];
var MapPolyLine;
var polylineCount = 0;
var polylineObj = [];
var MapPolygon;
var polygoneCount = 0;
var polygoneObj = [];
$(document).ready(function(){

$('#city').autocomplete({
            lookup: data,
            onSelect: function (suggestion) {
                // alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
            }
        });

});

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 24.135809, lng: 77.810874},
    zoom: 6
  });
  var i;
  for (i = 0; i < data.length; i++) {
    var Rec_id =data[i].Rec_id;
    var name = data[i].Rec_name;
    var city = data[i].City;
    var pin = data[i].pin;
    var lat = data[i].LAT;
    var long = data[i].LONG;
    var dc = data[i].DC;
    var dc_status = data[i].DC_status;
    var position = {
      lat: Number(lat),
      lng: Number(long)
    };
    var marker_color;
    if(Number(dc_status)==0){
      marker_color = 'http://mw1.google.com/crisisresponse/icons/teal_dot.png'
    }
    else if(Number(dc_status)==1){
      marker_color = 'http://www.geocodezip.com/mapIcons/small_yellow_dot.png'
    }
    else if(Number(dc_status)==2){
      marker_color = 'http://www.mapdent.com/maps/icons/circle/green.png' 
    }
    else if(Number(dc_status)==3){
      marker_color = 'http://www.aialosangeles.org/images/map-dot.png'
    }
    
    addMarker(position,marker_color,Rec_id,data,map);
  }
}
  
function addMarker(position,icon,rec_id,data,map){
  marker = new google.maps.Marker({
      position: position,
      icon: icon,
      id: rec_id-1,
      title: "Name:" + data[rec_id-1].Rec_name + "\nDC:" + data[rec_id-1].DC,
      map: map
      });

  var value_search = (document.getElementById('value_search'));
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(value_search);
  var city = (document.getElementById('city'));
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(city);

  markers[rec_id-1]=marker;
  marker.addListener('click', function() {
          map.panTo(this.position);
          map.setZoom(14);
          DeletePolyLines();
          ChangeMarkerColor();
          DeletePolygones();
          if(data[rec_id-1].DC_status==3){
            var count= 0 ;
            DC2markerArray = [];
            
            //Create a new instance.
            var convexHull = new ConvexHullGrahamScan();
            for (var j = 0; j <= data.length-1; j++) {
              if(data[rec_id-1].Rec_name==data[j].DC){
                Coordinates = [
                  {lat:Number(data[rec_id-1].LAT),lng:Number(data[rec_id-1].LONG)},
                  {lat:Number(data[j].LAT) , lng:Number(data[j].LONG)}
                ];
                // CreatePolyLines(map, Coordinates);
                
                //add points (needs to be done for each point, a foreach loop on the input array can be used.)
                convexHull.addPoint(Number(data[j].LAT),Number(data[j].LONG));
                // PolygonCoordinates[count] = new google.maps.LatLng(Number(data[j].LAT),Number(data[j].LONG));
                DC2markerArray[count] = j
                count = count + 1;
              }
            }
            var hullPoints = convexHull.getHull();
            // convert each value to number in hullpoint array
            var result_array = []
            for (var i = hullPoints.length - 1; i >= 0; i--) {
                  result_array[i] = new google.maps.LatLng(Number(hullPoints[i].x),Number(hullPoints[i].y));
            }
            CreatePolygone(result_array,map);
            DC2markerArray[count] = rec_id-1;
            HighlightConnectedMarker();
            
          }
          else if(data[rec_id-1].DC_status==2){
            for (var j = 0; j <= data.length-1; j++) {
              if(data[rec_id-1].DC==data[j].Rec_name){
                Coordinates = [
                  {lat:Number(data[rec_id-1].LAT),lng:Number(data[rec_id-1].LONG)},
                  {lat:Number(data[j].LAT) , lng:Number(data[j].LONG)}
                ];
                CreatePolyLines(map, Coordinates,j);
              }
            }
          }
  });
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
function CreatePolygone(PolygonCoordinate,map){
// Construct the polygon.
  MapPolygon = new google.maps.Polygon({
    paths: PolygonCoordinate,
    strokeColor: '#FF0000',
    strokeOpacity: 0.5,
    strokeWeight: 1,
    fillColor: '#FF0000',
    fillOpacity: 0.1
  });
  polygoneObj[polygoneCount] = MapPolygon
  polygoneCount = polygoneCount + 1;
  MapPolygon.setMap(map);
  
} 
function DeletePolygones(){
  for (var k = polygoneCount - 1; k >= 0; k--) {
    polygoneObj[k].setMap(null);
  }
}
function HighlightConnectedMarker(){
  for (var i = 0; i < DC2markerArray.length - 1 ; i++) {
    j=DC2markerArray[i];
    markers[j].setIcon('http://www.mapdent.com/maps/icons/circle/blue.png');
    markers[j].setZIndex(9999);
  }
  if(DC2markerArray.length-1 > 0){
    j=DC2markerArray[DC2markerArray.length - 1];
    markers[j].setIcon('https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png');
  }
}
function ChangeMarkerColor(){
  for (var i = 0; i < DC2markerArray.length - 1 ; i++) {
    j=DC2markerArray[i];
    markers[j].setIcon('http://www.mapdent.com/maps/icons/circle/green.png');
  }
  if(DC2markerArray.length-1 > 0){
    j=DC2markerArray[DC2markerArray.length - 1];
    markers[j].setIcon('http://www.aialosangeles.org/images/map-dot.png');
  }
}

function ConvexHullGrahamScan(){this.anchorPoint=void 0,this.reverse=!1,this.points=[]}ConvexHullGrahamScan.prototype={constructor:ConvexHullGrahamScan,Point:function(n,t){this.x=n,this.y=t},_findPolarAngle:function(n,t){var i,o,h=57.295779513082;if(!n||!t)return 0;if(i=t.x-n.x,o=t.y-n.y,0==i&&0==o)return 0;var r=Math.atan2(o,i)*h;return this.reverse?0>=r&&(r+=360):r>=0&&(r+=360),r},addPoint:function(n,t){return void 0===this.anchorPoint?void(this.anchorPoint=new this.Point(n,t)):this.anchorPoint.y>t&&this.anchorPoint.x>n||this.anchorPoint.y===t&&this.anchorPoint.x>n||this.anchorPoint.y>t&&this.anchorPoint.x===n?(this.points.push(new this.Point(this.anchorPoint.x,this.anchorPoint.y)),void(this.anchorPoint=new this.Point(n,t))):void this.points.push(new this.Point(n,t))},_sortPoints:function(){var n=this;return this.points.sort(function(t,i){var o=n._findPolarAngle(n.anchorPoint,t),h=n._findPolarAngle(n.anchorPoint,i);return h>o?-1:o>h?1:0})},_checkPoints:function(n,t,i){var o,h=this._findPolarAngle(n,t),r=this._findPolarAngle(n,i);return h>r?(o=h-r,!(o>180)):r>h?(o=r-h,o>180):!0},getHull:function(){var n,t,i=[];if(this.reverse=this.points.every(function(n){return n.x<0&&n.y<0}),n=this._sortPoints(),t=n.length,3>t)return n.unshift(this.anchorPoint),n;for(i.push(n.shift(),n.shift());;){var o,h,r;if(i.push(n.shift()),o=i[i.length-3],h=i[i.length-2],r=i[i.length-1],this._checkPoints(o,h,r)&&i.splice(i.length-2,1),0==n.length){if(t==i.length){var e=this.anchorPoint;return i=i.filter(function(n){return!!n}),i.some(function(n){return n.x==e.x&&n.y==e.y})||i.unshift(this.anchorPoint),i}n=i,t=n.length,i=[],i.push(n.shift(),n.shift())}}}},"function"==typeof define&&define.amd&&define(function(){return ConvexHullGrahamScan}),"undefined"!=typeof module&&(module.exports=ConvexHullGrahamScan);

