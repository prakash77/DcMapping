function ConvexHullGrahamScan(){
  this.anchorPoint=void 0,this.reverse=!1,this.points=[]
}
ConvexHullGrahamScan.prototype={
                    constructor:ConvexHullGrahamScan,
                    Point:function(n,t){this.x=n,this.y=t},
                    _findPolarAngle:function(n,t){
                      var i,o,h=57.295779513082;
                      if(!n||!t)
                        return 0;
                      if(i=t.x-n.x,o=t.y-n.y,0==i&&0==o)
                        return 0;
                      var r=Math.atan2(o,i)*h;
                      return this.reverse?0>=r&&(r+=360):r>=0&&(r+=360),r
                    },
                    addPoint:function(n,t){
                      return void 0===this.anchorPoint?void(this.anchorPoint=new this.Point(n,t)):this.anchorPoint.y>t&&this.anchorPoint.x>n||this.anchorPoint.y===t&&this.anchorPoint.x>n||this.anchorPoint.y>t&&this.anchorPoint.x===n?(this.points.push(new this.Point(Number(this.anchorPoint.x),Number(this.anchorPoint.y)),void(this.anchorPoint=new this.Point(n,t))):void this.points.push(new this.Point(Number(n),Number(t))
                    },
                    _sortPoints:function(){
                      var n=this;
                      return this.points.sort(function(t,i){
                        var o=n._findPolarAngle(n.anchorPoint,t),
                        h=n._findPolarAngle(n.anchorPoint,i);
                        return h>o?-1:o>h?1:0})
                    },
                    _checkPoints:function(n,t,i){
                      var o,h=this._findPolarAngle(n,t),r=this._findPolarAngle(n,i);
                      return h>r?(o=h-r,!(o>180)):r>h?(o=r-h,o>180):!0
                    },
                    getHull:function(){
                      var n,t,i=[];
                      if(this.reverse=this.points.every(function(n){return n.x<0&&n.y<0}),n=this._sortPoints(),t=n.length,3>t)
                        return n.unshift(this.anchorPoint),n;
                      for(i.push(n.shift(),n.shift());;){
                        var o,h,r;
                        if(i.push(n.shift()),o=i[i.length-3],h=i[i.length-2],r=i[i.length-1],this._checkPoints(o,h,r)&&i.splice(i.length-2,1),0==n.length){
                          if(t==i.length){
                            var e=this.anchorPoint;
                            return i=i.filter(function(n){return!!n}),i.some(function(n){return n.x==e.x&&n.y==e.y})||i.unshift(this.anchorPoint),i
                          }
                          n=i,t=n.length,i=[],i.push(n.shift(),n.shift())
                        }
                      }
                    }
                  },
                  "function"==typeof define&&define.amd&&define(function(){
                    return ConvexHullGrahamScan})
                  ,"undefined"!=typeof module&&(module.exports=ConvexHullGrahamScan);





//----------------------------------------------------------------
//    Point with coordinates {float x, y;}
//===================================================================


function sortPointX(a, b) {
    return a.lng() - b.lng();
}
function sortPointY(a, b) {
    return a.lat() - b.lat();
}

function isLeft(P0, P1, P2) {    
    return (P1.lng() - P0.lng()) * (P2.lat() - P0.lat()) - (P2.lng() - P0.lng()) * (P1.lat() - P0.lat());
}
//===================================================================

// chainHull_2D(): A.M. Andrew's monotone chain 2D convex hull algorithm
// http://softsurfer.com/Archive/algorithm_0109/algorithm_0109.htm
// 
//     Input:  P[] = an array of 2D points 
//                   presorted by increasing x- and y-coordinates
//             n = the number of points in P[]
//     Output: H[] = an array of the convex hull vertices (max is n)
//     Return: the number of points in H[]


function chainHull_2D(P, n, H) {
    // the output array H[] will be used as the stack
    var bot = 0,
    top = (-1); // indices for bottom and top of the stack
    var i; // array scan index
    // Get the indices of points with min x-coord and min|max y-coord
    var minmin = 0,
        minmax;
        
    var xmin = P[0].lng();
    for (i = 1; i < n; i++) {
        if (P[i].lng() != xmin) {
            break;
        }
    }
    
    minmax = i - 1;
    if (minmax == n - 1) { // degenerate case: all x-coords == xmin 
        H[++top] = P[minmin];
        if (P[minmax].lat() != P[minmin].lat()) // a nontrivial segment
            H[++top] = P[minmax];
        H[++top] = P[minmin]; // add polygon endpoint
        return top + 1;
    }

    // Get the indices of points with max x-coord and min|max y-coord
    var maxmin, maxmax = n - 1;
    var xmax = P[n - 1].lng();
    for (i = n - 2; i >= 0; i--) {
        if (P[i].lng() != xmax) {
            break; 
        }
    }
    maxmin = i + 1;

    // Compute the lower hull on the stack H
    H[++top] = P[minmin]; // push minmin point onto stack
    i = minmax;
    while (++i <= maxmin) {
        // the lower line joins P[minmin] with P[maxmin]
        if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin) {
            continue; // ignore P[i] above or on the lower line
        }
        
        while (top > 0) { // there are at least 2 points on the stack
            // test if P[i] is left of the line at the stack top
            if (isLeft(H[top - 1], H[top], P[i]) > 0) {
                break; // P[i] is a new hull vertex
            }
            else {
                top--; // pop top point off stack
            }
        }
        
        H[++top] = P[i]; // push P[i] onto stack
    }

    // Next, compute the upper hull on the stack H above the bottom hull
    if (maxmax != maxmin) { // if distinct xmax points
        H[++top] = P[maxmax]; // push maxmax point onto stack
    }
    
    bot = top; // the bottom point of the upper hull stack
    i = maxmin;
    while (--i >= minmax) {
        // the upper line joins P[maxmax] with P[minmax]
        if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax) {
            continue; // ignore P[i] below or on the upper line
        }
        
        while (top > bot) { // at least 2 points on the upper stack
            // test if P[i] is left of the line at the stack top
            if (isLeft(H[top - 1], H[top], P[i]) > 0) { 
                break;  // P[i] is a new hull vertex
            }
            else {
                top--; // pop top point off stack
            }
        }
        
        if (P[i].lng() == H[0].lng() && P[i].lat() == H[0].lat()) {
            return top + 1; // special case (mgomes)
        }
        
        H[++top] = P[i]; // push P[i] onto stack
    }
    
    if (minmax != minmin) {
        H[++top] = P[minmin]; // push joining endpoint onto stack
    }
    
    return top + 1;
}                  