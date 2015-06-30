//Draws lines and shapes.
//> To test:
//> draw.drawSquare()
//> draw.drawStar(sideLength, n)
//> draw.drawCircle()
//> draw.drawFromCoordinates()  

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
//The specific delay can be changed if the bot has to go slower or faster
//for a particular segment
doSetTimeout = function(x, y, z, delay) {
  setTimeout(function() { go(x, y, z) }, timer);
  timer = timer + delay; 
};

//Initialized out here so that they are accessible from the mapPoints function
var baseHeight, baseWidth, canvasHeight, canvasWidth, penHeight, heightRatio, widthRatio, halfway;

//A timer variable for use with doSetTimeout()
var timer = 0;

//Set the penHeight from the command line
Draw.prototype.setPenHeight = function(height) {
  penHeight = height;
  console.log("The pen is now set at: " + height);
}

//Loops through the JSON array
Draw.prototype.drawFromCoordinates = function() {

  baseHeight = this.baseHeight;
  baseWidth = this.baseWidth;
  canvasHeight = baseHeight * 3.779527559; //Set ratio of ~1:3.8 mm:px
  canvasWidth = baseWidth * 3.779527559;

  //The Z coordinate of the pen, for drawing
  penHeight = -140;

  //The ratio between the sizes of the canvas and robot.
  //It will always be 3.779527559 because the canvas size is set
  //according to that ratio
  heightRatio = 3.779527559;
  widthRatio = 3.779527559;

  //The center of the canvas
  halfway = {x:canvasWidth / 2, y:canvasHeight / 2};


  var jFile = fs.readFileSync('.//data.json', 'utf8'); //Reads data from a JSON file of coordinates
  var objArr = JSON.parse(jFile); //Creates an array out of the data

  for (var i = 0; i < objArr.length; i++) {
    var x = 0;
    if (objArr[i].length > 0) { //If there are multiple lines
      var point = objArr[i][x];
      var transMap = mapPoints(point.x, point.y);
      doSetTimeout(transMap.x, transMap.y, penHeight + 20, 200); //Moves the arm vertically so that it does not draw a line between the last point of one line and the first point of another

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
  setTimeout(function() { go(-20, -20, penHeight); }, 0); //Bottom left
  setTimeout(function() { go(0, 20, penHeight); }, 1000); //Top
  setTimeout(function() { go(20, -20, penHeight); }, 2000); //Bottom right
  setTimeout(function() { go(-20, 10, penHeight); }, 3000); //Left
  setTimeout(function() { go(20, 10, penHeight); }, 4000); //Right
  setTimeout(function() { go(-20, -20, penHeight); }, 5000); //Starting position
};

Draw.prototype.drawCircle = function() {
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
      setTimeout( function(point) { go(point.x, point.y, penHeight) }, i*2, points[i]);
    }
  }
   
  circle();
  };

//Draws an arbitrary amount of spirals to test that the Tapster bot is working properly
Draw.prototype.drawSpiral= function(spirals) {
  var centerX = 0;
  var centerY = 0;
  var radius = 30;
  var x1 = 0;
  var y1 = 0;
  var points = [];
  for (var degree = 0; degree < spirals * 360; degree++) {
    x1 = x1 + 30/(spirals * 360);
    y1 = y1 + 30/(spirals * 360);
    var radians = degree * Math.PI/180;
    var x = centerX + x1 * Math.cos(radians);
    var y = centerY + y1 * Math.sin(radians);
    points.push({x:x, y:y});
  }

  spiral = function() {
    for (var z = 0; z < spirals*360; z++) {
      setTimeout( function(point) { go(point.x, point.y, penHeight) }, z*2, points[z]);
    }
  }
    spiral();
}; 

module.exports.Draw = Draw;
