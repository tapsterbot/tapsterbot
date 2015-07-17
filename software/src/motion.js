/* 

// Usage:
// motion.move(pointA, pointB, numberOfSteps, easingType, timeDeltaInMilliseconds)
// Example
$ node bot.js 
>> motion = require('./motion')
>> motion.move([0,0,-140],[-20,20,-140], 20, 'easeInOutCubic', 500)
>> motion.move([-20,60,-165],[-20,-60,-165], 30, 'easeInOutCubic', 20)
>> motion.move([-20,-60,-165],[-20,60,-165], 30, 'easeInOutCubic', 20)


Usage:
> motion = require('./motion')
> motion.directionVector([0,0,-100], [5,10,-150])
[ 5, 10, -50 ]

> var A = [1,6,3];
> var B = [8,2,7];
> motion.directionVector(A, B);
[ 7, -4, 4 ]


Reference:
Line between two points in 3D space: http://mathcentral.uregina.ca/QQ/database/QQ.09.01/murray2.html
Easing functions: https://gist.github.com/gre/1650294

*/
var EasingFunctions = {
  linear: function (t) { return t },
  easeInQuad: function (t) { return t*t },
  easeOutQuad: function (t) { return t*(2-t) },
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  easeInCubic: function (t) { return t*t*t },
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  easeInQuart: function (t) { return t*t*t*t },
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  easeInQuint: function (t) { return t*t*t*t*t },
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
};

(function(exports) {
  var directionVector = function(pointA, pointB) {
    var vector = [ pointB[0] - pointA[0],
                   pointB[1] - pointA[1],
                   pointB[2] - pointA[2] ];
    return vector;
  }
  
  // (x,y,z) = (1,6,3) + t(7,-4,4) = (1 + 7t, 6 - 4t, 3 + 4t).
  var parametricEquation = function(pointA, pointB) {
    var dv = directionVector(pointA, pointB);
    var equation = function(t) {
      return [ pointA[0] + dv[0]*t,
               pointA[1] + dv[1]*t,
               pointA[2] + dv[2]*t ];
    }
    return equation;
  }
  
  // get an array of points between (and including) two end points
  // numberOfSteps and easingType are required
  var getPoints = function(pointA, pointB, numberOfSteps, easingType) {
    var points = [];
    var point = parametricEquation(pointA, pointB);
    var easingFunction = EasingFunctions[easingType];
    
    for (var i = 0; i <= numberOfSteps; i++) {
      t = easingFunction(i/numberOfSteps);
      points.push(point(t))
    }
    return points;
  }
  
  var move = function(pointA, pointB, numberOfSteps, easingType, timeDelta) {
    var points = getPoints(pointA, pointB, numberOfSteps, easingType);
    for (var i=0; i<points.length; i++) {
      setTimeout( function(point) { moveServosTo(point[0], point[1], point[2]); }, i*timeDelta, points[i] );
    }
  };
  
  exports.directionVector = directionVector;
  exports.parametricEquation = parametricEquation;
  exports.getPoints = getPoints;
  exports.move = move;

}(typeof exports === 'undefined' ? this.ik = {} : exports));  