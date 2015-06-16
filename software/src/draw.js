//Draws lines and shapes.
//> To test:
//> draw.drawSquare()
//> draw.drawStar()
//> draw.drawCircle()
//> draw.drawFromCoordinates()

var fs = require('fs');

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
doSetTimeout = function(i, z, delay)
{
  setTimeout(function() { go(i.x, i.y, z) }, timer);
  timer = timer + delay; 
};

var jFile = fs.readFileSync('./data.json', 'utf8'); //Reads data from a JSON file of coordinates
var objArr = JSON.parse(jFile); //Creates an array out of the data

//Specific dimensions of the canvas and Tapster. Change as needed.
//Uses a modified version of the canvas program to make it easier to map from canvas to Tapster.
var canvasHeight = 500;
var canvasWidth = 300;
var phoneHeight = 100;
var phoneWidth = 60;

//The ratio between the sizes of the canvas and robot.
var heightRatio = canvasHeight / phoneHeight;
var widthRatio = canvasWidth / phoneWidth;

//The center of the canvas
var halfway = {x:canvasWidth / 2, y:canvasHeight / 2};

//A timer variable for use with doSetTimeout()
var timer = 0;

//Loops through the JSON array
exports.drawFromCoordinates = function() {
for (var i = 0; i < objArr.length; i++)
{
  var x = 0;
  if (objArr[i].length > 0) //If there are multiple lines
  {
  var point = objArr[i][x];
  var transMap = mapPoints(point.x, point.y);
  doSetTimeout(transMap, -130, 200); //Moves the arm vertically so that it does not draw a line between the last point of one line and the first point of another

  for (x = 0; x < objArr[i].length; x++)
  {
    point = objArr[i][x];
    var mapped = mapPoints(point.x, point.y); 
    doSetTimeout(mapped, -140, 100);
  }
  transMap = mapPoints(point.x, point.y);
  doSetTimeout(transMap, -130, 200); 
  }
  else //Only one line to be drawn
  { 
  point = objArr[i];
  var mapped = mapPoints(point.x, point.y);
  doSetTimeout(mapped, -140, 100);
}
}
};

//Draws a square in order to ensure that everything is working properly
exports.drawSquare = function() {
  setTimeout(function() { go(-20, 20, -150); }, 0); //Top left 
  setTimeout(function() { go(20, 20, -150); }, 1000); //Top right
  setTimeout(function() { go(20, -20, -150); }, 2000); //Bottom right
  setTimeout(function() { go(-20, -20, -150); }, 3000); //Bottom left
  setTimeout(function() { go(-20, 20, -150); }, 4000); //Return to start position
};

//Draws a star to test that the Tapster bot is working properly
exports.drawStar = function() {
  setTimeout(function() { go(-20, -20, -140); }, 0); //Bottom left
  setTimeout(function() { go(0, 20, -140); }, 1000); //Top
  setTimeout(function() { go(20, -20, -140); }, 2000); //Bottom right
  setTimeout(function() { go(-20, 10, -140); }, 3000); //Left
  setTimeout(function() { go(20, 10, -140); }, 4000); //Right
  setTimeout(function() { go(-20, -20, -140); }, 5000); //Starting position
};

exports.drawCircle = function() {
  var centerX=0;
  var centerY=0;
  var radius=20;
 ;
  // an array to save your points
  var points=[];
   
  // populate array with points along a circle
  for (var degree=0; degree<360; degree++){
      var radians = degree * Math.PI/180;
      var x = centerX + radius * Math.cos(radians);
      var y = centerY + radius * Math.sin(radians);
      points.push({x:x,y:y});
  }
   
  circle = function() {
    for (var i=0; i<360; i+=1) {
      setTimeout( function(point) { go(point.x, point.y, -141) }, i*2, points[i]);
    }
  }
   
  circle();
  };

//Draws an arbitrary amount of spirals to test that the Tapster bot is working properly
exports.drawSpiral= function(spirals) {
  var centerX = 0;
  var centerY = 0;
  var radius = 30;
  var x1 = 0;
  var y1 = 0;
  var points = [];
  for (var degree = 0; degree < spirals * 360; degree++)
  {
    x1 = x1 + 30/(spirals * 360);
    y1 = y1 + 30/(spirals * 360);
    var radians = degree * Math.PI/180;
    var x = centerX + x1 * Math.cos(radians);
    var y = centerY + y1 * Math.sin(radians);
    points.push({x:x, y:y});
  }

  spiral = function() {
    for (var z = 0; z < spirals*360; z++)
    {
      setTimeout( function(point) { go(point.x, point.y, -140) }, z*2, points[z]);
    }
  }
    spiral();
};
