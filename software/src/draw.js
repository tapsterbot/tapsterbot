//Draws lines and shapes.
//> To test:
//> draw.drawSquare(sideLength, n)
//> draw.drawStar()
//> draw.drawCircle()
//> draw.drawFromCoordinates()  
//> draw.erase()

var fs = require('fs');

function Draw(args) {
  this.baseWidth = 0;
  this.baseHeight = 0;

  if (args) {
    var keys = Object.keys(args);
    keys.forEach(function(key){
      this[key] = args[key];
    }, this)
  }
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
doSetTimeout = function(x, y, z, delay) {
  setTimeout(function() { go(x, y, z) }, timer);
  currentPoint = {x: x, y: y, z: z};
  timer = timer + delay; 
};

//A go method that iterates over points rather than jumping from a to b
//Assumes that z stays the same
//Draws points + 1 points
//Delay is the total amount of time that it takes
//Each point takes delay / points time to draw
itGo = function(x, y, z, points, delay) {
  var x1 = currentPoint.x;
  var y1 = currentPoint.y;
  var deltaX = x - x1;
  var deltaY = y - y1;
  var slope = ((y - y1) / (x - x1));
  var pointArray = new Array();

  for (var i = 0; i <= points; i++) {
    var newX = x1 + deltaX / points * i; 
    var newY = y1 + deltaY / points * i;
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
var penHeight = -140;

//A timer variable for use with doSetTimeout()
var timer = 0;

//Set the penHeight from the command line
Draw.prototype.setPenHeight = function(height) {
  penHeight = height;
  console.log("The pen is now set at: " + height);
}

//Draws an image from a JSON file of coordinates
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

  timer = 0; //Reset the timer so that there isn't unnecessary delay when calling the function multiple times

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
  timer = 0;
  doSetTimeout(-20, -20, penHeight, 1000);
  doSetTimeout(0, 20, penHeight, 1000);
  doSetTimeout(20, -20, penHeight, 1000);
  doSetTimeout(-20, 10, penHeight, 1000);
  doSetTimeout(20, 10, penHeight, 1000);
  doSetTimeout(-20, -20, penHeight, 1000);

  /*setTimeout(function() { go(-20, -20, penHeight); }, 0); //Bottom left
  setTimeout(function() { go(0, 20, penHeight); }, 1000); //Top
  setTimeout(function() { go(20, -20, penHeight); }, 2000); //Bottom right
  setTimeout(function() { go(-20, 10, penHeight); }, 3000); //Left
  setTimeout(function() { go(20, 10, penHeight); }, 4000); //Right
  setTimeout(function() { go(-20, -20, penHeight); }, 5000); //Starting position
  */
};

Draw.prototype.drawCircle = function() {
  timer = 0;
  var centerX=0;
  var centerY=0;
  var radius=20;

  // an array to save your points
  var points=[];
   
  // populate array with points along a circle
  //Goes to 390 degrees so that the circle is actually completed
  for (var degree=0; degree<390; degree++) {
      var radians = degree * Math.PI/180;
      var x = centerX + radius * Math.cos(radians);
      var y = centerY + radius * Math.sin(radians);
      points.push({x:x,y:y});
  }
   
  circle = function() {
    for (var i=0; i<390; i+=1) {
      point = points[i];
      doSetTimeout(point.x, point.y, penHeight, 2);
    }
  }
   
  circle();
  };

//Draws an arbitrary amount of spirals to test that the Tapster bot is working properly
//Spirals is the amount of spirals to draw
//Radius is the diameter(?) of the largest spiral
//zLevel is optional -- it is the penHeight to draw the spiral at (mainly used for the erase function)
Draw.prototype.drawSpiral= function(spirals, radius, zLevel) {
  timer = 0;
  var centerX = 0;
  var centerY = 0;
  var x1 = 0;
  var y1 = 0;
  var points = [];

  if (zLevel) //If a zLevel is specified set the penHeight at that level
    penHeight = zLevel;

  go(centerX, centerY, penHeight);

  for (var degree = 0; degree < spirals * 360 + 94; degree++) {
    x1 = x1 + radius/(spirals * 360);
    y1 = y1 + radius/(spirals * 360);
    var radians = degree * Math.PI/180;
    var x = centerX + x1 * Math.cos(radians);
    var y = centerY + y1 * Math.sin(radians);
    points.push({x:x, y:y});
  }

  spiral = function() {
    for (var z = 0; z < spirals*360 + 94; z++) {
      point = points[z];
      doSetTimeout(point.x, point.y, penHeight, 5);
    }
  }
    spiral();
}; 

Draw.prototype.pickUpEraser = function() {
  doSetTimeout(currentPoint.x, currentPoint.y, -130, 500);
  doSetTimeout(0, 50, -130, 500);
  doSetTimeout(0, 50, -148, 500);
  doSetTimeout(0, 0, -148, 500);

  /*
  timer = 0;
  doSetTimeout(currentPoint.x, currentPoint.y, -130, 500);
  doSetTimeout(65, 25, -130, 500);
  doSetTimeout(55, 20, -148, 1000);
  var x = currentPoint.x;
  var y = currentPoint.y;
  while (x > 0 || y > 0) {
    if (x / 10 > 1)
      x -= 10;
    else if (y / 10 > 1)
      y -= 10;
    else {
      x = 0;
      y = 0;
    }

    doSetTimeout(x, y, -148, 100);
  } */
}

Draw.prototype.eraseBoard = function() {
  this.drawSpiral(5, 55, -148); //Draws a spiral to erase most of the board

  //WIP code for erasing the very edges of the board
  //Commented by default because it's not reliable
  /*
  doSetTimeout(70, 10, -148, 7500);
  itGo(40, 60, -149, 5, 500);
  itGo(10, 55, -149, 5, 500);
  itGo(-40, 55, -149, 5, 500);
  itGo(-50, 27.5, -149, 5, 500);
  itGo(-60, 0, -149, 5, 500);
  itGo(-40, -40, -149, 5, 500);
  itGo(-30, -60, -149, 5, 500);
  itGo(0, -60, -149, 5, 500);
  itGo(30, -60, -149, 5, 500);
  itGo(50, -20, -149, 5, 500);
  */

}

Draw.prototype.dropOffEraser = function() {
 // doSetTimeout(0, 50, -148, 500);
 doSetTimeout(-1, 50, -130, 500);
 doSetTimeout(0, 0, -130, 500);

  /* doSetTimeout(55, 20, -148, 500);
  doSetTimeout(63, 25, -130, 500);
  doSetTimeout(0, 0, -130, 500); */
}

Draw.prototype.erase = function() {
  var objRef = this;
  setTimeout(function() { objRef.pickUpEraser() }, 0);
  setTimeout(function() { objRef.eraseBoard() }, 3000);
  setTimeout(function() { objRef.dropOffEraser() }, 10000);
  console.log(timer);
}

module.exports.Draw = Draw;
