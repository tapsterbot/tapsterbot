//Draws stuff from SVG files
//Built with InkScape in mind, but should support:
//http://svg-edit.googlecode.com/svn/branches/stable/editor/svg-editor.html

//> To test:
//> svg.draw("filename.svg")

var parse = require('svg-path-parser');
var fs = require('fs');
var config = require('../config.js');
var parseString = require('xml2js').parseString;

//filename must be a string. ".svg" is optional
//Right now, the file is assumed to be in the software folder
//To-do: Add support for arbitrary file locations
exports.draw = function(filename) {
	var parsed;

	if (filename.search(".svg") == -1) //Ensures that filename is valid and points to an .svg
		filename += ".svg";

	//Create a JSON string out of the SVG image data
	//parseString strips away the XML data

	try {
	parseString(fs.readFileSync("../" + filename, "utf8"), function(err, result) {
		parsed = JSON.stringify(result, null, 1);
	});
	} catch (e) {
		if (e.code === "ENOENT")
			console.log("File not found.");
		else
			throw e;

		return;
	}

	//Parse the JSON string into an array
	objArr = JSON.parse(parsed);

	var svgDimensions = dimensionConversion(objArr.svg.$.width, objArr.svg.$.height);
	width = svgDimensions.width;
	height = svgDimensions.height; 

	transformX = 0;
	transformY = 0;

	//Check for translation and account for it
	//To-do: Do this more elegantly
	if (objArr.svg.g[0].$ && objArr.svg.g[0].$.transform) { //Done in multiple checks to avoid errors being thrown
		var transString = objArr.svg.g[0].$.transform;
		var subX = transString.indexOf("(");
		transformX = parseInt(transString.substring(subX + 1));
		var subY = transString.indexOf(",");
		transformY = parseInt(transString.substring(subY + 1));
	}

	var phoneWidth = config.baseWidth;
	var phoneHeight = config.baseHeight;
	penHeight = config.penHeight;

	widthRatio = width / phoneWidth;
	heightRatio = height / phoneHeight;

	halfway = {x:width / 2, y:height / 2};
	currentPoint = {x:halfway.x, y:halfway.y}; //Start at the center of the canvas, which corresponds to (0,0) on the Tapster

	timer = 0;

	if (objArr.svg.g[0].g) {  //If there are multiple groups
		for (var i = 0; i < objArr.svg.g[0].g.length; i++) {
			pathArray = objArr.svg.g[0].g[i].path;
			drawSVG();
		}
	}

	else if (objArr.svg.g[0].path) {
		pathArray = objArr.svg.g[0].path;
		drawSVG();
	}
}

drawSVG = function() {
	var d = "";
	for (var i = 0; i < pathArray.length; i++) { //When drawing multiple lines, there are multiple paths
		firstPoint = "";
		d = pathArray[i].$.d; 
		var commands = parse(d);
		interpretCommands(commands); 
		if (i < (pathArray.length - 1)) { //Smooth transition to the next path			
			doSetTimeout(mapX(currentPoint.x), mapY(currentPoint.y), penHeight + 10, 150); //Moves the pen up and over so no line is drawn between the two
			doSetTimeout(mapX(parse(pathArray[i+1].$.d)[0].x), mapY(parse(pathArray[i+1].$.d)[0].y), penHeight + 10, 300);
			doSetTimeout(mapX(parse(pathArray[i+1].$.d)[0].x), mapY(parse(pathArray[i+1].$.d)[0].y), penHeight, 450);
		} 
	}
}

//Move from one point to (x, y)
move = function(x, y) {
	doSetTimeout(mapX(x), mapY(y), penHeight, 150);
	currentPoint = {x:x, y:y}; //Update the current point (done every time an SVG command is called)
	if (!firstPoint) { //Keeps track of the first point, for use with the Z/z command
		firstPoint = {x:currentPoint.x, y:currentPoint.y}; //Since the first command of a path is always to Move, this check only occurs here
	}
}

//Move from one point to that that point + x, y
relMove = function(x, y) {
	x = currentPoint.x + x;
	y = currentPoint.y + y;

	move(x, y);	
}

//Draw a line from one point to (x, y)
line = function(x, y) {
	doSetTimeout(mapX(x), mapY(y), penHeight, 150);
	currentPoint = {x:x, y:y};
}

//Draw a line from one point to that point + x, y
relLine = function(x, y) {
	x = currentPoint.x + x;
	y = currentPoint.y + y;

	line(x, y);
}

//Draws a cubic Bezier curve.
//(x1,y1) is the first control point
//(x2, y2) is the second
//(x, y) is the end point
cubicCurve = function(x1, y1, x2, y2, x, y) {

	//Function for calculating the coordinates of points on the curve
	//Calculates t+1 points
	b = function(x1, y1, x2, y2, x, y, t) {
		var ptArray = new Array();
		for (var i = 0; i <= t; i++) {
			var newI = i/t; //Converts i to a decimal, to satisfy 0 <= i <= 1
			var ptX = (Math.pow((1-newI), 3) * currentPoint.x) + (3 * Math.pow((1-newI), 2) * newI * x1) //Formula from Wikipedia page for Bezier curves
					  + (3 * (1-newI) * Math.pow(newI, 2) * x2) + (Math.pow(newI, 3) * x);
			var ptY = (Math.pow((1-newI), 3) * currentPoint.y) + (3 * Math.pow((1-newI), 2) * newI * y1)
					  + (3 * (1-newI) * Math.pow(newI, 2) * y2) + (Math.pow(newI, 3) * y);
			var newPt = {x:ptX, y:ptY};
			ptArray.push(newPt); //Populates the array with points
		}
		currentPoint = {x:ptArray[t].x, y:ptArray[t].y};
		return ptArray;
	}
	
	var curvePts = new Array();
	curvePts = b(x1, y1, x2, y2, x, y, 5); //5 is an arbitrarily-chosen value. It creates a smooth-looking curve without calculating too many points
	for (var i = 0;i < curvePts.length; i++) 
		doSetTimeout(mapX(curvePts[i].x), mapY(curvePts[i].y), penHeight, 2);
}

//Draws a relative cubic Bezier curve
relCubicCurve = function(x1, y1, x2, y2, x, y)
{
	var tempX = currentPoint.x;
	var tempY = currentPoint.y;
	cubicCurve(tempX + x1, tempY + y1, tempX + x2, tempY + y2, tempX + x, tempY + y);	
}

//Draws a quadratic Bezier curve
//(x1, y1) is the control point
//(x, y) is the end point
quadraticCurve = function(x1, y1, x, y) {

	//Helper function for generating the points
	q = function(x1, y1, x, y, t) {
		var ptArray = new Array();
		for (var i = 0; i <= t; i++) {
			var newI = i/t; //Converts i to a decimal, to satisfy 0 <= i <= 1
			var ptX = Math.pow((1-newI), 2)*currentPoint.x + (2 * (1-newI) * newI * x1) + (Math.pow(newI, 2) * x); //From Wikipedia page for Bezier curves
			var ptY = Math.pow((1-newI), 2)*currentPoint.y + (2 * (1-newI) * newI * y1) + (Math.pow(newI, 2) * y);
			var newPt = {x:ptX, y:ptY};
			ptArray.push(newPt);
		}
		currentPoint = {x:ptArray[t].x, y:ptArray[t].y};
		return ptArray;
	}

	var curvePts = new Array();
	curvePts = q(x1, y1, x, y, 5);
	for (var i = 0; i < curvePts.length; i++) 
		doSetTimeout(mapX(curvePts[i].x), mapY(curvePts[i].y), penHeight, 2);
}

//Draws a relative quadratic Bezier curve
relQuadraticCurve = function(x1, y1, x, y) {
	var tempX = currentPoint.x;
	var tempY = currentPoint.y;
	quadraticCurve(tempX + x1, tempY + y1, tempX + x, tempY + y);
}

//Draws an elliptical arc
//rx and ry are the radii
//rotation is the angle (in degrees) between the rotated x-axis and the original x-axis
//largeArc is a flag that determines if the arc is greater than or less than or equal to 180 degrees
//sweep is a flag that determines if the arc is drawn in a positive direction or a negative direction
//(x, y) is the final point of the arc
//From: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
arc = function(rx, ry, rotation, largeArc, sweep, x, y) {

	//Helper function for calculating the points
	a = function(rx, ry, largeArc, sweep, x, y, t) {
		var ptArray = new Array();

		for (var i = 0; i <= t; i++) {
			var newI = i / t;
			var angle = startAngle + sweepAngle * newI;
			var newPt = {x: cx + rx * cos(angle), y: cy + ry * sin(angle)};
			ptArray.push(newPt);
		}

		currentPoint = {x: ptArray[t].x, y: ptArray[t].y};
		return ptArray;
	}

	//Helper function for calculating the angle between two vectors
	angleBetween = function(v1, v2) {
		var p = v1.x*v2.x + v1.y*v2.y;
		var n = Math.sqrt((Math.pow(v1.x, 2)+Math.pow(v1.y, 2)) * (Math.pow(v2.x, 2)+Math.pow(v2.y, 2)));
		var sign = v1.x*v2.y - v1.y*v2.x < 0 ? -1 : 1;
		var angle = sign*Math.acos(p/n) * 180 / Math.PI;
		
		return angle;
	}

	tempX = currentPoint.x;
	tempY = currentPoint.y;

	var xPrime = (cos(rotation) * ((tempX - x) / 2)) + (sin(rotation) * ((tempY - y) / 2));
	var yPrime = (-sin(rotation) * ((tempX - x) / 2)) + (cos(rotation) * ((tempY - y) / 2));

	//Checks to ensure radii are as they should be
	rx = Math.abs(rx); //Ensures they are non-zero and positive
	ry = Math.abs(ry); 

	var lambda = (Math.pow(xPrime, 2) / Math.pow(rx, 2)) + (Math.pow(yPrime, 2) / Math.pow(ry, 2)); 

	if (lambda > 1) { //Ensures they are large enough
		rx = Math.sqrt(lambda) * rx;
		ry = Math.sqrt(lambda) * ry;
	}		

	var sign = 1;

	if (largeArc == sweep) //If they are equal, cPrime is negative
		sign = -1;

	//For some reason this would occasionally result in NaN
	//Implemented this check at the suggestion of:
	//http://users.ecs.soton.ac.uk/rfp07r/interactive-svg-examples/arc.html
	var cPrimeNumerator = ((Math.pow(rx, 2) * Math.pow(ry, 2)) - (Math.pow(rx, 2) * Math.pow(yPrime, 2)) - (Math.pow(ry, 2) * Math.pow(xPrime, 2)));
	var cPrimeDenom = ((Math.pow(rx, 2) * Math.pow(yPrime, 2)) + (Math.pow(ry, 2) * Math.pow(xPrime, 2)));

	if ((cPrimeNumerator / cPrimeDenom) < 1e-7) 
			cPrime = 0;
	else
		cPrime = Math.sqrt(cPrimeNumerator / cPrimeDenom);

	//Calculates the transformed center
	var cxPrime = sign * cPrime * ((rx * yPrime) / ry);
	var cyPrime = sign * cPrime * (-(ry * xPrime) / rx);

	//Calculates the original center
	var cx = ((cos(rotation) * cxPrime) + (-sin(rotation) * cyPrime)) + ((tempX + x) / 2);
	var cy = ((sin(rotation) * cxPrime) + (cos(rotation) * cyPrime)) + ((tempY + y) / 2);

	//Calculates the start angle of the arc and the total change in the angle
	var startVector = {x: (xPrime - cxPrime) / rx, y: (yPrime - cyPrime) / ry};
	var startAngle = angleBetween({x:1, y:0}, startVector);
	var endVector = {x: (-xPrime - cxPrime) / rx, y: (-yPrime - cyPrime) / ry};
	var sweepAngle = angleBetween(startVector, endVector);

	if (!sweep && sweepAngle > 0) {
		sweepAngle -= 360;
	}

	else if (sweep && sweepAngle < 0) {
		sweepAngle += 360;
	}

	sweepAngle %= 360;

	var ptArray = a(rx, ry, largeArc, sweep, x, y, 7);

	for (var i = 0; i < ptArray.length; i++) {
		doSetTimeout(mapX(ptArray[i].x), mapY(ptArray[i].y), penHeight, 75);
	}
}

//Function for drawing a relative elliptical arc
relArc = function(rx, ry, rotation, largeArc, sweep, x, y) {
	x = currentPoint.x + x;
	y = currentPoint.y + y;

	arc(rx, ry, rotation, largeArc, sweep, x, y);
}

//A separate setTimeout method so that delays work properly
doSetTimeout = function(x, y, z, delay) {
 	setTimeout(function() { go(x, y, z) }, timer);
 	timer = timer + delay; 
};

//Reflects the point (x,y) across the point (x1, y1)
//For use with smooth curves
reflect = function(x, y, x1, y1) {
	var tempX = x;
	var tempY = y;

	tempX = x1 - (tempX - x1);
	tempY = y1 - (tempY - y1);

	var point = {x:tempX, y:tempY};

	return point;
}

//Convert points pixel coordinates to Tapster coordinates
//Done in two methods for ease of use
mapX = function(x) {
	var newX = x + transformX;
	newX = (newX - halfway.x) / widthRatio; //The center of the canvas corresponds to (0, 0) on the Tapster
  	return newX;
};

mapY = function(y) {
	var newY = y + transformY	;
	newY = (halfway.y - newY) / heightRatio;
	return newY;
}

// A sine function for working with degrees, not radians
sin = function(degree) {
    return Math.sin(Math.PI * (degree/180));
}

// A cosine function for working with degrees, not radians
cos = function(degree) {
    return Math.cos(Math.PI * (degree/180));
}

//Function for converting Inkscape dimensions into Tapster-friendly pixels
dimensionConversion = function(width, height) {
	width = String(width);
	if (width.search("mm") != -1) {
		var dimension = {width: parseInt(width) * 3.779527559, height: parseInt(height) * 3.779527559}; //The px:mm ratio is ~ 3.8:1
	}
	else if (width.search("in") != -1) {
		var dimension = {width: parseInt(width) * 96, height: parseInt(height) * 96}; //The px:in ratio is 96:1
	}
	else if (width.search("ft") != -1) {
		var dimension = {width: parseInt(width) * 96 * 12, height: parseInt(height) * 96 * 12}; //The px:ft ratio is 96*12:1
	}
	else if (width.search("m") != -1) {
		var dimension = {width: parseInt(width) * 3.779527559 * 1000, height: parseInt(height) * 3.779527559 * 1000}; //The px:m ratio is ~3.8*1000:1
	}
	else if (width.search("cm") != -1) {
		var dimension = {width: parseInt(width) * 3.779527559 * 100, height: parseInt(height) * 3.779527559 * 100}; //The px:cm ratio is ~3.8*100:1
	}
	else if (width.search("pt") != -1) {
		var dimension = {width: parseInt(width) * 1.3333, height: parseInt(height) * 1.3333}; //The px:pt ratio is ~1.3:1
	}
	else if (width.search("pc") != -1) {
		var dimension = {width: parseInt(width) * 16, height: parseInt(height) * 16}; //The px:pc ratio is 16:1
	}
	else //No unit specified == pixels
		var dimension = {width: width, height: height};

	return dimension;
}

//Goes through the list of commands an generated by the SVG-Path-Parser and calls the corresponding functions
interpretCommands = function(commands) {
	for (var i = 0; i < commands.length; i++) {
		var cmdCode = commands[i].code;
		if (cmdCode == 'M') {	
			move(commands[i].x, commands[i].y);
		}

		else if (cmdCode == 'm') {
			relMove(commands[i].x, commands[i].y);
		}

		else if (cmdCode == 'L') {
			line(commands[i].x, commands[i].y);
		}

		else if (cmdCode == 'l') {
			relLine(commands[i].x, commands[i].y);
		}

		else if (cmdCode == 'V') {
			line(currentPoint.x, commands[i].y);
		}

		else if (cmdCode == 'v') {
			relLine(currentPoint.x, commands[i].y);
		}

		else if (cmdCode == 'H') {
			line(commands[i].x, currentPoint.y);
		}

		else if (cmdCode == 'h') {
			relLine(commands[i].x, currentPoint.y);
		}

		else if (cmdCode == 'C') {
			cubicCurve(commands[i].x1, commands[i].y1, commands[i].x2, commands[i].y2, commands[i].x, commands[i].y);
		}

		else if (cmdCode == 'c') {
			relCubicCurve(commands[i].x1, commands[i].y1, commands[i].x2, commands[i].y2, commands[i].x, commands[i].y);
		}

		//Smooth cubic curve
		else if (cmdCode == 'S') {
			if (i > 1 && (commands[i-1].code == 's' || commands[i-1].code == 'c' || commands[i-1].code == 'C' || commands[i-1].code == 'S')) {
				var reflected = reflect(commands[i].x, commands[i].y, commands[i-1].x, commands[i-1].y);
				var ctrl = {x:reflected.x, y:reflected.y};
			}
			else
				var ctrl = {x:currentPoint.x, y:currentPoint.y};

			cubicCurve(ctrl.x, ctrl.y, commands[i].x2, commands[i].y2, commands[i].x, commands[i].y);
		}

		//Smooth relative cubic curve
		else if (cmdCode == 's') {
			if (i > 1 && (commands[i-1].code == 's' || commands[i-1].code == 'c' || commands[i-1].code == 'C' || commands[i-1].code == 'S')) {
				var reflected = reflect(commands[i].x, commands[i].y, commands[i-1].x, commands[i-1].y);
				var ctrl = {x:reflect(commands[i-1].x2).x, y:reflect(commands[i-1].y2).y};
			}
			else
				var ctrl = {x:currentPoint.x, y:currentPoint.y};

			relCubicCurve(ctrl.x, ctrl.y, commands[i].x2, commands[i].y2, commands[i].x, commands[i].y);
		}

		else if (cmdCode == 'Q') {
			quadraticCurve(commands[i].x1, commands[i].y1, commands[i].x, commands[i].y);
		}

		else if (cmdCode == 'q') {
			relQuadraticCurve(commands[i].x1, commands[i].y1, commands[i].x, commands[i].y);
		}

		//Smooth quadratic curve
		else if (cmdCode == 'T') {
			if (i > 1 && (commands[i-1].code == 't' || commands[i-1].code == 'q' || commands[i-1].code == 'Q' || commands[i-1].code == 'T')) {
				var reflected = reflect(commands[i].x, commands[i].y, commands[i-1].x, commands[i-1].y);
				var ctrl = {x:reflect(commands[i-1].x1).x, y:reflect(commands[i-1].y1).y};
			}
			else
				var ctrl = {x:currentPoint.x, y:currentPoint.y};

			quadraticCurve(ctrl.x, ctrl.y, commands[i].x, commands[i].y);
		}

		//Smooth relative quadratic curve
		else if (cmdCode == 't') {
			if (i > 1 && (commands[i-1].code == 't' || commands[i-1].code == 'q' || commands[i-1].code == 'Q' || commands[i-1].code == 'T')) {
				var reflected = reflect(commands[i].x, commands[i].y, commands[i-1].x, commands[i-1].y);
				var ctrl = {x:reflect(commands[i-1].x1).x, y:reflect(commands[i-1].y1).y};
			}
			else
				var ctrl = {x:currentPoint.x, y:currentPoint.y};

			relQuadraticCurve(ctrl.x, ctrl.y, commands[i].x, commands[i].y);
		}

		else if (cmdCode == 'A')
			arc(commands[i].rx, commands[i].ry, commands[i].xAxisRotation, commands[i].largeArc, commands[i].sweep, commands[i].x, commands[i].y);

		else if (cmdCode == 'a')
			relArc(commands[i].rx, commands[i].ry, commands[i].xAxisRotation, commands[i].largeArc, commands[i].sweep, commands[i].x, commands[i].y);
		
		else if (cmdCode == 'Z' || cmdCode == 'z') {
			line(firstPoint.x, firstPoint.y);
		}
	}
}

//Timer variable for use with the doSetTimeout method
var timer = 0;

//Saves the coordinates of the first point drawn
var firstPoint;

var objArr;
var pathArray;

var widthRatio;
var heightRatio;
var halfway;
var currentPoint;
var penHeight;

var transformX;
var transformY;
