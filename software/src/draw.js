//Draws lines and shapes.
//> To test:
//> draw.drawSquare(sideLength, n)
//> draw.drawStar()
//> draw.drawCircle()
//> draw.drawFromCoordinates()  
//> draw.erase()

var fs = require('fs');
var objRef, defaultEaseType;
var calculated, spiralPts;

function Draw(args) {
  this.baseWidth = 80;
  this.baseHeight = 95;
  this.drawHeight = -140;
  this.defaultEaseType = "linear";

  if (args) {
    var keys = Object.keys(args);
    keys.forEach(function(key){
      this[key] = args[key];
    }, this)
  }
  penHeight = this.drawHeight;
  defaultEaseType = this.defaultEaseType;
  objRef = this;
}

//Maps point from canvas to the Tapster coordinate plane
//The conversion is based on the canvas size and the size of the Tapster base
//These can be changed as needed
mapPoints = function(x, y) {
  var newX = x;
  var newY = y;

  newX = (newX - halfway.x) / widthRatio;
  newY = (halfway.y - newY) / heightRatio;
  return {x:newX, y:newY};
};

//Adds delays while the Tapster is writing
//The specific delay can be changed if the bot has to go slower or faster for a particular segment
/*doSetTimeout = function(x, y, z, delay, easing) {
  if (!easing)
    easing = defaultEaseType;
  setTimeout(function() { go([x, y, z], easing) }, timer);
  currentPoint = {x: x, y: y, z: z};
  timer = timer + delay; 
}; */

//A go method that iterates over points rather than jumping from a to b
//Assumes that z stays the same
//Draws points + 1 points
//Delay is the total amount of time that it takes
//Each point takes delay / points time to draw
Draw.prototype.itGo = function(x, y, x1, y1, points, delay) {
  //var x1 = currentPoint.x;
  //var y1 = currentPoint.y;
  var z = penHeight;
  var deltaX = x1 - x;
  var deltaY = y1 - y;
  var slope = ((y1 - y) / (x1 - x));
  var pointArray = new Array();

  for (var i = 0; i <= points; i++) {
    var newX = x + deltaX / points * i; 
    var newY = y + deltaY / points * i;
    var point = {x: newX, y: newY};
    pointArray.push(point);
  }

  for (var i = 0; i < pointArray.length; i++) {
    doSetTimeout(pointArray[i].x, pointArray[i].y, z, delay / points);
  }
}

//Initialized here so that they are accessible from the mapPoints function
var baseHeight, baseWidth, canvasHeight, canvasWidth, heightRatio, widthRatio, halfway;

var currentPoint = {x: 0, y: 0, z: -140};
var penHeight = this.drawHeight;

//Set the penHeight from the command line
Draw.prototype.setPenHeight = function(height) {
  penHeight = height;
  console.log("The pen is now set at: " + height);
}

//Draws an image from a JSON file of coordinates
//The SVGReader drawSVG method is preferred
Draw.prototype.drawFromCoordinates = function() {

  baseHeight = this.baseHeight;
  baseWidth = this.baseWidth;
  canvasHeight = baseHeight * 3.779527559; //Set ratio of ~1:3.8 mm:px
  canvasWidth = baseWidth * 3.779527559;

  //The ratio between the sizes of the canvas and robot.
  //It will always be 3.779527559 because the canvas size is set
  //according to that ratio
  heightRatio = 3.779527559;
  widthRatio = 3.779527559;

  //The center of the canvas
  halfway = {x:canvasWidth / 2, y:canvasHeight / 2};


  var jFile = fs.readFileSync('.//data.json', 'utf8'); //Reads data from a JSON file of coordinates
  var objArr = JSON.parse(jFile); //Creates an array out of the data

  //Loops through the JSON array
  for (var i = 0; i < objArr.length; i++) {
    var x = 0;
    if (objArr[i].length > 0) { //If there are multiple lines
      var point = objArr[i][x];
      var transMap = mapPoints(point.x, point.y);
      doSetTimeout(transMap.x, transMap.y, penHeight + 20, 200); //Moves the arm vertically so that it does not draw a line between the last point of one line 
                                                                 //and the first point of another

      for (x = 0; x < objArr[i].length; x++) {
        point = objArr[i][x];
        var mapped = mapPoints(point.x, point.y); 
        doSetTimeout(mapped.x, mapped.y, penHeight, 100);
      }
      transMap = mapPoints(point.x, point.y);
      doSetTimeout(transMap.x, transMap.y, penHeight + 20, 200); 
    }

    else { //Only one line to be drawn
      point = objArr[i];
      var mapped = mapPoints(point.x, point.y);
      doSetTimeout(mapped.x, mapped.y, penHeight, 100);
    }
  }
};

//Draws a square in order to ensure that everything is working properly
//sideLength is the length of the sides
//Draws every nth point
Draw.prototype.drawSquare = function(sideLength, n) {

  resetTimer(); //Reset the timer so that there isn't unnecessary delay when calling the function multiple times

  if (!n)
    var n = 2;

  var halfSide = sideLength / 2;
  var points = sideLength / n;

  doSetTimeout(-halfSide, halfSide, penHeight + 10, 0)
  doSetTimeout(-halfSide, halfSide, penHeight, 500); //Top left corner

  for (var i = 0; i < points; i++) { //To bottom left
    doSetTimeout(-halfSide, halfSide - (n * i), penHeight, i * 5);
  }

  for (var i = 0; i < points; i++) { //To bottom right
    doSetTimeout(-halfSide + (n * i), -halfSide, penHeight, i * 5);
  }

  for (var i = 0; i < points; i++) { //To top right
    doSetTimeout(halfSide, -halfSide + (n * i), penHeight, i * 5);
  }

  for (var i = 0; i < points; i++) { //To top left
    doSetTimeout(halfSide - (n * i), halfSide, penHeight, i * 5);
  }

  doSetTimeout(0, 0, -140, timer + 100);

};

//Draws a star to test that the Tapster bot is working properly
Draw.prototype.drawStar = function() {
  resetTimer();
  doSetTimeout(-20, -20, penHeight, 1000);
  doSetTimeout(0, 30, penHeight, 1000);
  doSetTimeout(20, -20, penHeight, 1000);
  doSetTimeout(-30, 10, penHeight, 1000);
  doSetTimeout(30, 10, penHeight, 1000);
  doSetTimeout(-20, -20, penHeight, 1000);

  //-20, -20, 0, 30, 20, -20
};


Draw.prototype.drawTriangle = function(x, y, x1, y1, x2, y2) {
  resetTimer();
  doSetTimeout(x, y, penHeight, 1000);
  doSetTimeout(x1, y1, penHeight, 1000);
  doSetTimeout(x2, y2, penHeight, 1000);
  doSetTimeout(x, y, penHeight, 1000);
}

Draw.prototype.drawCircle = function(radius, x, y) {
  //40
  resetTimer();
  if (x && y) {
    var centerX = x;
    var centerY = y;
  }

  else {
    var centerX = 0;
    var centerY = 0;
  }

  var radius=radius;

  // an array to save your points
  var points=[];

  // populate array with points along a circle
  //Goes slightly over so that the circle is actually completed
  for (var degree=0; degree < 395; degree++) {
      var radians = (degree + 90) * Math.PI/180;
      var x = centerX + radius * Math.cos(radians);
      var y = centerY + radius * Math.sin(radians);
      points.push({x:x,y:y});
  }
   
  circle = function() {
    doSetTimeout(0, 0, -120, 50, "none");
    doSetTimeout(points[0].x, points[0].y, penHeight + 10, 150, "none");
    doSetTimeout(points[0].x, points[0].y, penHeight, 150, "none");
    for (var i=0; i<points.length; i+=1) {
      point = points[i];
      doSetTimeout(point.x, point.y, penHeight, 2, "none");
    }
  }
   
  circle();
  };

//Draws an arbitrary amount of spirals to test that the Tapster bot is working properly
//Spirals is the amount of spirals to draw
//Radius is the diameter(?) of the largest spiral
//zLevel is optional -- it is the penHeight to draw the spiral at (mainly used for the erase function)
Draw.prototype.drawSpiral = function(spirals, radius, zLevel, ptArray) {

  resetTimer();
  var centerX = 0;
  var centerY = 0;
  var x1 = 0;
  var y1 = 0;
  var points = [];

  if (zLevel) //If a zLevel is specified set the penHeight at that level
    penHeight = zLevel;

  if (ptArray) {
    points = ptArray;
  }

  //Draws additional points, mainly for use with the erase function
  //The extra points allow the eraser to end up in its resting positio
  else {
    for (var degree = 0; degree < spirals * 360 + 95; degree++) {
      x1 = x1 + radius/(spirals * 360);
      y1 = y1 + radius/(spirals * 360);
      var radians = degree * Math.PI/180;
      var x = centerX + x1 * Math.cos(radians);
      var y = centerY + y1 * Math.sin(radians);
      points.push({x:x, y:y});
    }
    //doSetTimeout(points[0].x, points[0].y, penHeight + 10, 150);
    //doSetTimeout(points[0].x, points[0].y, penHeight, 150, "none");
  }

  spiral = function() {
    for (var z = 0; z < points.length; z++) {
      point = points[z];
      doSetTimeout(point.x, point.y, penHeight, 5, "none");
    }
  }

  spiral();
  return points;
}; 

Draw.prototype.test = function() {
  var objRef = this;
  setTimeout(function() { objRef.drawCircle(15, 20, 23.75) }, 1000);
  setTimeout(function() { go([-30, 10, penHeight + 20]) }, 6500);
  setTimeout(function() { star(-30, 10, -20, 30, -15, 10, 5) }, 7000);
  setTimeout(function() { go([-10, -10, penHeight + 20]) }, 16000);
  setTimeout(function() { square(-10, -10, -30, -10, -30, -30, -10, -30) }, 18000);
  setTimeout(function() { go([10, -30, penHeight + 20]) }, 25000);
  setTimeout(function() { objRef.drawTriangle(10, -30, 20, -10, 30, -30) }, 27000);
  setTimeout(function() { go([0, 0, -140]) }, 31000);

  square = function(x, y, x1, y1, x2, y2, x3, y3) {
    resetTimer();
    doSetTimeout(x, y, penHeight, 1000);
    doSetTimeout(x1, y1, penHeight, 1000);
    doSetTimeout(x2, y2, penHeight, 1000);
    doSetTimeout(x3, y3, penHeight, 1000);
    doSetTimeout(x, y, penHeight, 1000);
  }

  star = function(x, y, x1, y1, x2, y2, diff) {
    resetTimer();
    doSetTimeout(x, y, penHeight, 1000);
    doSetTimeout(x1, y1, penHeight, 1000);
    doSetTimeout(x2, y2, penHeight, 1000);
    doSetTimeout(x - diff, y1 * 3 / 4, penHeight, 1000);
    doSetTimeout(x2 + diff, y1 * 3 / 4, penHeight, 1000);
    doSetTimeout(x, y, penHeight, 1000);
  };
}

Draw.prototype.pickUpEraser = function() {
  eraseHeight = this.drawHeight + 5.25;
  //doSetTimeout(currentPoint.x, currentPoint.y, -130, 500);
  doSetTimeout(0, 48, -140, 500);
  doSetTimeout(0, 48, eraseHeight, 500, "none");
  doSetTimeout(0, 0, eraseHeight, 500);
}

Draw.prototype.eraseBoard = function() {
  eraseHeight = this.drawHeight + 5.25;

  if (!calculated) {
    spiralPts = this.drawSpiral(4, 55, eraseHeight);
    calculated = true;
  }
  else {
    this.drawSpiral(4, 55, eraseHeight, spiralPts);
  }
}

Draw.prototype.dropOffEraser = function() {
  eraseHeight = this.drawHeight + 5.25;
  doSetTimeout(0, 50, eraseHeight, 500);
  doSetTimeout(-4, 50, -130, 500, "none");
  doSetTimeout(0, 0, -130, 500);
}

Draw.prototype.erase = function(callback) {
  var objRef = this;
  setTimeout(function() { objRef.pickUpEraser() }, 0);
  setTimeout(function() { objRef.eraseBoard() }, 3000);
  setTimeout(function() { objRef.dropOffEraser() }, 10000);

  if (callback)
    setTimeout(function() {callback() }, 12500);
}

module.exports.Draw = Draw;