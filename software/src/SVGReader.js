//Draws stuff from SVG files
//Built with InkScape in mind, but should support:
//http://svg-edit.googlecode.com/svn/branches/stable/editor/svg-editor.html
//> To test:
//> svgRead.drawSVG(filepath)

var parse = require('svg-path-parser');
var fs = require('fs');
var draw = require("./draw");
var parseString = require('xml2js').parseString;

function SVGReader(args) {
	this.baseWidth = 80;
	this.baseHeight = 95;
	this.drawHeight = -140;
	this.delay = 150;
	this.defaultEaseType = "linear";

	if (args) {
    	var keys = Object.keys(args)
    	keys.forEach(function(key){
      		this[key] = args[key]
    	}, this)
  	}
	objRef = this;
	defaultEaseType = this.defaultEaseType;
}

//Draws from an SVG image specified by filepath
//> Usage:
//> drawSVG("C:/Projects/Tapsterbot/software/src/drawing.svg");
//Note: filePath can be relative
//connect is a special flag that indicates that each path should be drawn connected to each other
//It is really only used for drawing in cursive and does not need to be specified otherwise
SVGReader.prototype.drawSVG = function(filePath, connect) {
	resetTimer();
	var parsed;

	if (connect)
		connected = connect;
	else
		connected = null;

	objRef = this;

	//Create a JSON string out of the SVG image data
	//parseString strips away the XML data
	try {
		parseString(fs.readFileSync(filePath, "utf8"), function(err, result) {
		parsed = JSON.stringify(result, null, 1);
	});
	} catch (e) {
		if (e.code === "ENOENT")
			console.log("File not found.");
		else
			throw e;

		return; //If the file is not found stop execution
	}

	//Parse the JSON string into an array
	objArr = JSON.parse(parsed);

	//Extract width and height data from the drawing
	var svgDimensions = dimensionConversion(objArr.svg.$.width, objArr.svg.$.height);
	width = svgDimensions.width;
	height = svgDimensions.height; 

	//Check for translation and account for it
	//Commented out because going to stop supporting transformations
	/*
	transformX = 0;
	transformY = 0;

	if (objArr.svg.g[0].$ && objArr.svg.g[0].$.transform) { //Done in multiple checks to avoid errors being thrown
		var transString = objArr.svg.g[0].$.transform;
		var subX = transString.indexOf("(");
		transformX = parseInt(transString.substring(subX + 1));
		var subY = transString.indexOf(",");
		transformY = parseInt(transString.substring(subY + 1));
	}
	*/

	var phoneWidth = this.baseWidth;
	var phoneHeight = this.baseHeight;
	penHeight = this.drawHeight;

	widthRatio = width / phoneWidth;
	heightRatio = height / phoneHeight;

	halfway = {x:width / 2, y:height / 2};
	currentPoint = {x:halfway.x, y:halfway.y}; //Start at the center of the canvas, which corresponds to (0,0) on the Tapster

	if (objArr.svg.g[0].g && objArr.svg.g[0].g[0].path) {  //If there are multiple groups. Additional check to make sure that there is actually path data
		for (var i = 0; i < objArr.svg.g[0].g.length; i++) {
			pathArray = objArr.svg.g[0].g[i].path;
			drawImage(pathArray);
		} 
	}

	else if (objArr.svg.g.length > 0) { //Depending on how the paths are grouped, it is possible that this value can be greater than zero
		for (var i = 0; i < objArr.svg.g.length; i++) { //If this is the case, loop through the array to get the path data
			pathArray = objArr.svg.g[i].path;
			drawImage(pathArray);
		}
	}

	else if (objArr.svg.g[0].path) { //If there is only one group
		pathArray = objArr.svg.g[0].path;
		drawImage(pathArray);
	}

	doSetTimeout(0, 48, -130, delay);
	//setTimeout(function() { resetTimer() }, timer + 5);
}

drawImage = function(pathArray) {
	var d = "";
	firstMove = null; //After a group is done being drawn, firstMove is reset as there has not yet been a first move made in the next group
	for (var i = 0; i < pathArray.length; i++) { //When drawing multiple lines, there are multiple paths
		firstPoint = null;
		d = pathArray[i].$.d; 
		var commands = parse(d);
		objRef.interpretCommands(commands); 
		/* if (i < (pathArray.length - 1)) { //Smooth transition to the next path			
			doSetTimeout(mapX(currentPoint.x), mapY(currentPoint.y), penHeight + 10, 300); //Moves the pen up and over so no line is drawn between the two
			doSetTimeout(mapX(parse(pathArray[i+1].$.d)[0].x), mapY(parse(pathArray[i+1].$.d)[0].y), penHeight + 10, 300);
			doSetTimeout(mapX(parse(pathArray[i+1].$.d)[0].x), mapY(parse(pathArray[i+1].$.d)[0].y), penHeight, 300);
		}  */
	}
	doSetTimeout(mapX(currentPoint.x), mapY(currentPoint.y), penHeight + 10, delay);
}

//Move from one point to (x, y)
move = function(x, y) {
	var ptArray = [];
	if (!connected) { //If the paths should not be connected, lift up the pen and move over so that a line is not drawn
		doSetTimeout(mapX(currentPoint.x), mapY(currentPoint.y), penHeight + 10, delay, "none");
		doSetTimeout(mapX(x), mapY(y), penHeight + 10, delay, "none");
		doSetTimeout(mapX(x), mapY(y), penHeight, delay, "none");
		//svg.drawSVG("C:/Projects/Tapsterbot/software/src/hello/helloChF.svg")
		//ptArray.push({x:mapX(currentPoint.x), y:mapY(currentPoint.y), z:penHeight + 10});
		//ptArray.push({x:mapX(x), y:mapY(y), z:penHeight + 10});
		//ptArray.push({x:mapX(x), y:mapY(y), z:penHeight});	
	}
	else if (connected && !firstMove) { //If the paths should be connected and a move has not been made, lift up the pen and move to the first point
		doSetTimeout(mapX(currentPoint.x), mapY(currentPoint.y), penHeight + 10, delay, "none");
		doSetTimeout(mapX(x), mapY(y), penHeight + 10, delay, "none");
		doSetTimeout(mapX(x), mapY(y), penHeight, delay, "none");
		//ptArray.push({x:mapX(currentPoint.x), y:mapY(currentPoint.y), z:penHeight + 10});
		//ptArray.push({x:mapX(x), y:mapY(y), z:penHeight + 10});
		//ptArray.push({x:mapX(x), y:mapY(y), z:penHeight});	
	}
	else //If the paths should be connected and a move has been made, just draw a line between the two paths
		doSetTimeout(mapX(x), mapY(y), penHeight, delay);
		//ptArray.push({x:mapX(x), y:mapY(y), z:penHeight});	

	currentPoint = {x:x, y:y}; //Update the current point (done every time an SVG command is called)

	if (!firstMove) //Keeps track of if a move has been made or not.
		firstMove = true;

	if (!firstPoint) //Keeps track of the first point, for use with the Z/z command
		firstPoint = {x:currentPoint.x, y:currentPoint.y}; //Since the first command of a path is always to Move, this check only occurs here

	//return ptArray;
}

//Move from one point to that that point + x, y
relMove = function(x, y) {
	x = currentPoint.x + x;
	y = currentPoint.y + y;

	//return move(x, y);	
	move(x, y);
}

//Draw a line from one point to (x, y)
line = function(x, y) {
	var ptArray = [];
	doSetTimeout(mapX(x), mapY(y), penHeight, delay, "linear");
	//ptArray.push({x:mapX(x), y:mapY(y), z:penHeight});
	currentPoint = {x:x, y:y};

}

//Draw a line from one point to that point + x, y
relLine = function(x, y) {
	x = currentPoint.x + x;
	y = currentPoint.y + y;

	//return line(x, y);
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
			var ptX = (Math.pow((1-newI), 3) * currentPoint.x) + (3 * Math.pow((1-newI), 2) * newI * x1) //From https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
					  + (3 * (1-newI) * Math.pow(newI, 2) * x2) + (Math.pow(newI, 3) * x);
			var ptY = (Math.pow((1-newI), 3) * currentPoint.y) + (3 * Math.pow((1-newI), 2) * newI * y1)
					  + (3 * (1-newI) * Math.pow(newI, 2) * y2) + (Math.pow(newI, 3) * y);
			var newPt = {x:ptX, y:ptY, z:penHeight};
			ptArray.push(newPt); //Populates the array with points
		}
		currentPoint = {x:ptArray[t].x, y:ptArray[t].y};
		return ptArray;
	}
	
	var curvePts = new Array();
	curvePts = b(x1, y1, x2, y2, x, y, 5); //Arbitrarily-chosen value. It creates a smooth-looking curve without calculating too many points
	for (var i = 0;i < curvePts.length; i++) 
		doSetTimeout(mapX(curvePts[i].x), mapY(curvePts[i].y), penHeight, delay*2 / curvePts.length, "none"); //The cubic curve command takes 2*delay ms to complete so that an accurate curve is created
	//return b(x1, y1, x2, y2, x, y, 8);
}

//Draws a relative cubic Bezier curve
relCubicCurve = function(x1, y1, x2, y2, x, y)
{
	var tempX = currentPoint.x;
	var tempY = currentPoint.y;
	//return cubicCurve(tempX + x1, tempY + y1, tempX + x2, tempY + y2, tempX + x, tempY + y);	
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
			var ptX = Math.pow((1-newI), 2)*currentPoint.x + (2 * (1-newI) * newI * x1) + (Math.pow(newI, 2) * x); //From https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B.C3.A9zier_curves
			var ptY = Math.pow((1-newI), 2)*currentPoint.y + (2 * (1-newI) * newI * y1) + (Math.pow(newI, 2) * y);
			var newPt = {x:ptX, y:ptY, z:penHeight};
			ptArray.push(newPt);
		}
		currentPoint = {x:ptArray[t].x, y:ptArray[t].y};
		return ptArray;
	}

	var curvePts = new Array();
	curvePts = q(x1, y1, x, y, 5);
	for (var i = 0; i < curvePts.length; i++) 
		doSetTimeout(mapX(curvePts[i].x), mapY(curvePts[i].y), penHeight, delay*2 / curvePts.length, "none");
	//return q(x1, y1, x, y, 8);
}

//Draws a relative quadratic Bezier curve
relQuadraticCurve = function(x1, y1, x, y) {
	var tempX = currentPoint.x;
	var tempY = currentPoint.y;
	//return quadraticCurve(tempX + x1, tempY + y1, tempX + x, tempY + y);
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
			var newPt = {x: cx + rx * cos(angle), y: cy + ry * sin(angle), z:penHeight};
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

	var ptArray = a(rx, ry, largeArc, sweep, x, y, 5);

	for (var i = 0; i < ptArray.length; i++) {
		doSetTimeout(mapX(ptArray[i].x), mapY(ptArray[i].y), penHeight, delay*2 / ptArray.length, "none");
	}

	//return a(rx, ry, largeArc, sweep, x, y, 10);
}

//Function for drawing a relative elliptical arc
relArc = function(rx, ry, rotation, largeArc, sweep, x, y) {
	x = currentPoint.x + x;
	y = currentPoint.y + y;

	//return arc(rx, ry, rotation, largeArc, sweep, x, y);
	arc(rx, ry, rotation, largeArc, sweep, x, y);
}

//A function for setting the penHeight from the command line
setPenHeight = function(penHeight) {
	penHeight = penHeight;
}

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
	var newX = x;
	newX = (newX - halfway.x) / widthRatio; //The center of the canvas corresponds to (0, 0) on the Tapster
  	return newX;
};

mapY = function(y) {
	var newY = y;
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
//Should switch to switch statements
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
//Should switch to switch statements
SVGReader.prototype.interpretCommands = function(commands) {
	delay = this.delay;
	for (var i = 0; i < commands.length; i++) {
		var cmdCode = commands[i].code;
				switch (cmdCode) {
			case 'M':	
				move(commands[i].x, commands[i].y);
				break;

			case 'm':
				relMove(commands[i].x, commands[i].y);
				break;

			case 'L': 
				line(commands[i].x, commands[i].y);
				break;

			case 'l':
				relLine(commands[i].x, commands[i].y);
				break;

			case 'V':
				line(currentPoint.x, commands[i].y);
				break;

			case 'v':
				relLine(currentPoint.x, commands[i].y);
				break;

			case 'H':
				line(commands[i].x, currentPoint.y);
				break;

			case 'h':
				relLine(commands[i].x, currentPoint.y);
				break;

			case 'C':
				cubicCurve(commands[i].x1, commands[i].y1, commands[i].x2, commands[i].y2, commands[i].x, commands[i].y);
				break;

			case 'c':
				relCubicCurve(commands[i].x1, commands[i].y1, commands[i].x2, commands[i].y2, commands[i].x, commands[i].y);
				break;

			//Smooth cubic curve
			case 'S':
				if (i > 1 && (commands[i-1].code == 's' || commands[i-1].code == 'c' || commands[i-1].code == 'C' || commands[i-1].code == 'S')) {
					var reflected = reflect(commands[i].x, commands[i].y, commands[i-1].x, commands[i-1].y);
					var ctrl = {x:reflected.x, y:reflected.y};
				}
				else
					var ctrl = {x:currentPoint.x, y:currentPoint.y};

				cubicCurve(ctrl.x, ctrl.y, commands[i].x2, commands[i].y2, commands[i].x, commands[i].y);
				break;

			//Smooth relative cubic curve
			case 's':
				if (i > 1 && (commands[i-1].code == 's' || commands[i-1].code == 'c' || commands[i-1].code == 'C' || commands[i-1].code == 'S')) {
					var reflected = reflect(commands[i].x, commands[i].y, commands[i-1].x, commands[i-1].y);
					var ctrl = {x:reflect(commands[i-1].x2).x, y:reflect(commands[i-1].y2).y};
				}
				else
					var ctrl = {x:currentPoint.x, y:currentPoint.y};

				relCubicCurve(ctrl.x, ctrl.y, commands[i].x2, commands[i].y2, commands[i].x, commands[i].y);
				break;

			case 'Q':
				quadraticCurve(commands[i].x1, commands[i].y1, commands[i].x, commands[i].y);
				break;

			case 'q':
				relQuadraticCurve(commands[i].x1, commands[i].y1, commands[i].x, commands[i].y);
				break;

			//Smooth quadratic curve
			case 'T':
				if (i > 1 && (commands[i-1].code == 't' || commands[i-1].code == 'q' || commands[i-1].code == 'Q' || commands[i-1].code == 'T')) {
					var reflected = reflect(commands[i].x, commands[i].y, commands[i-1].x, commands[i-1].y);
					var ctrl = {x:reflect(commands[i-1].x1).x, y:reflect(commands[i-1].y1).y};
				}
				else
					var ctrl = {x:currentPoint.x, y:currentPoint.y};

				quadraticCurve(ctrl.x, ctrl.y, commands[i].x, commands[i].y);
				break;

			//Smooth relative quadratic curve
			case 't':
				if (i > 1 && (commands[i-1].code == 't' || commands[i-1].code == 'q' || commands[i-1].code == 'Q' || commands[i-1].code == 'T')) {
					var reflected = reflect(commands[i].x, commands[i].y, commands[i-1].x, commands[i-1].y);
					var ctrl = {x:reflect(commands[i-1].x1).x, y:reflect(commands[i-1].y1).y};
				}
				else
					var ctrl = {x:currentPoint.x, y:currentPoint.y};

				relQuadraticCurve(ctrl.x, ctrl.y, commands[i].x, commands[i].y);
				break;

			case 'A':
				arc(commands[i].rx, commands[i].ry, commands[i].xAxisRotation, commands[i].largeArc, commands[i].sweep, commands[i].x, commands[i].y);
				break;

			case 'a':
				relArc(commands[i].rx, commands[i].ry, commands[i].xAxisRotation, commands[i].largeArc, commands[i].sweep, commands[i].x, commands[i].y);
				break;

			case 'Z': 
				line(firstPoint.x, firstPoint.y);
				firstPoint = null;
				break;
			
			case 'z':
				line(firstPoint.x, firstPoint.y);
				firstPoint = null;
				break;
			}
		}
	}

//Creates a working clock
SVGReader.prototype.clock = function() {
	var dimensions = dimensionConversion("80mm", "95mm"); //Since no dimensions are specified, assume the default
														  //To-do: Pull this from a config file
	width = dimensions.width;
	height = dimensions.height;

	objRef = this;

	resetTimer();
	connected = false;

	//Used to access the erase functions
	var drawing = new draw.Draw({ 
		baseWidth: objRef.baseWidth,
		baseHeight: objRef.baseHeight,
		drawHeight: objRef.drawHeight
	});

	var phoneWidth = this.baseWidth;
	var phoneHeight = this.baseHeight;

	widthRatio = width / phoneWidth;
	heightRatio = height / phoneHeight;

	penHeight = this.drawHeight;
	halfway = {x:width / 2, y:height / 2};
	currentPoint = {x:halfway.x, y:halfway.y}; //Start at the center of the canvas, which corresponds to (0,0) on the Tapster

	//Currently hardcoded path data
	var zero = "M 40.890286,241.44557 30.687127,245.57254 23.885021,257.95342 20.483968,278.58823 20.483968,290.96912 23.885021,311.60393 30.687127,323.98482 40.890286,328.11178 47.692392,328.11178 57.895551,323.98482 64.697657,311.60393 68.09871,290.96912 68.09871,278.58823 64.697657,257.95342 57.895551,245.57254 47.692392,241.44557 40.890286,241.44557";
	var one = "M 50.289453,243.07635 50.289453,329.52761";
	var two = "M 27.618803,262.08031 27.618803,257.95271 30.945521,249.69749 34.27224,245.56989 40.925676,241.44228 54.23255,241.44228 60.885986,245.56989 64.212704,249.69749 67.539423,257.95271 67.539423,266.20792 64.212704,274.46313 57.559268,286.84595 24.292085,328.12202 70.866141,328.12202";
	var three = "M 33.809127,248.8729 C 45.779077,241.87747 46.887418,243.5556 53.186196,243.05913 61.663816,242.39092 65.286579,246.55715 64.812967,252.72615 64.140416,261.48642 55.207358,274.28536 40.185777,283.01419 L 52.623884,281.94331 59.295192,285.47169 62.630846,289.00007 65.9665,299.58523 65.9665,306.64193 62.630846,317.22713 55.959538,324.28383 45.952576,327.81223 35.945614,327.81223 25.938652,324.28383 22.602998,320.75553 19.267344,313.69873";
	var four = "M 54.845427,241.51709 22.803997,300.19076 70.866142,300.19076 M 54.845427,241.51709 54.845427,329.5276";
	var five = "M 61.700462,246.77512 26.654546,246.77512 23.149954,281.56734 26.654546,277.70154 37.168321,273.83574 47.682096,273.83574 58.19587,277.70154 65.205054,285.43315 68.709645,297.03055 68.709645,304.76216 65.205054,316.35956 58.19587,324.09117 47.682096,327.95697 37.168321,327.95697 26.654546,324.09117 23.149954,320.22537 19.645363,312.49376";
	var six = "M 64.294901,253.7887 60.65789,245.53396 49.746856,241.40659 42.472833,241.40659 31.561799,245.53396 24.287776,257.91607 20.650765,278.55291 20.650765,299.18976 24.287776,315.69923 31.561799,323.95397 42.472833,328.08134 46.109844,328.08134 57.020878,323.95397 64.294901,315.69923 67.931912,303.31713 67.931912,299.18976 64.294901,286.80765 57.020878,278.55291 46.109844,274.42554 42.472833,274.42554 31.561799,278.55291 24.287776,286.80765 20.650765,299.18976";
	var seven = "M 68.262659,241.73033 32.158284,328.90301 M 17.716535,241.73033 68.262659,241.73033";
	var eight = "M 37.489233,241.44557 27.286074,245.57254 23.885021,253.82646 23.885021,262.08039 27.286074,270.33431 34.08818,274.46127 47.692392,278.58823 57.895551,282.7152 64.697657,290.96912 68.09871,299.22304 68.09871,311.60393 64.697657,319.85785 61.296604,323.98482 51.093445,328.11178 37.489233,328.11178 27.286074,323.98482 23.885021,319.85785 20.483968,311.60393 20.483968,299.22304 23.885021,290.96912 30.687127,282.7152 40.890286,278.58823 54.494498,274.46127 61.296604,270.33431 64.697657,262.08039 64.697657,253.82646 61.296604,245.57254 51.093445,241.44557 37.489233,241.44557";
	var nine = "M 67.931912,270.29818 64.2949,282.68028 57.020878,290.93502 46.109844,295.06239 42.472833,295.06239 31.561799,290.93502 24.287776,282.68028 20.650765,270.29818 20.650765,266.17081 24.287776,253.7887 31.561799,245.53396 42.472833,241.40659 46.109844,241.40659 57.020878,245.53396 64.2949,253.7887 67.931912,270.29818 67.931912,290.93502 64.2949,311.57186 57.020878,323.95397 46.109844,328.08134 38.835821,328.08134 27.924787,323.95397 24.287776,315.69923";

	pathData = [zero, one, two, three, four, five, six, seven, eight, nine];

	var colon = "M 165.73227,300.21546 Z M 165.73227,253.34648 Z";
	var arrayTime = new Array();

	objRef = this;

	//Simple function for converting units in millimeters to units in pixels
	//Based on the fixed ratio between mm and px
	toPixels = function(mm) {
		return mm * 3.779527559;
	}

	//Draws the time
	//Takes an array of path data and a callback function
	drawTime = function(arrayOfPaths, callback) {
		for (var i = 0; i < arrayOfPaths.length; i++) {
			objRef.interpretCommands(arrayOfPaths[i]); //Interprets the path data and draws the number

			firstPoint = null;

			if (i == 1) //Inserts the colon between the second and third number
				objRef.interpretCommands(parse(colon));
		}
		doSetTimeout(0, 0, -140, delay);
		setTimeout(function() { endTime = new Date().getTime() }, timer + 1); //Gets the time after drawTime finishes executing
		//Because of the way doSetTimeout works, timer + 1 occurs (is meant to occur) a millisecond after the doSetTimeout call
		setTimeout(function() { difference = endTime - startTime }, timer + 3);
		setTimeout(function() { callback() }, timer + 4);
	}

	//Gets the curent time and converts it into an array of four digits
	//The first two digits are the hours, the last two are the minutes
	getTheTime = function() {
		var currentTime = new Date()
		var hours = String(currentTime.getHours());
		var minutes = String(currentTime.getMinutes());

		//Converts from 24 hour time to 12 hour time
		if (hours > 12)
			hours -= 12;
		else if (hours === 0)
			hours = 12;

		//Adds a placeholder zero to ensure that there are four digits in the time
		//The zero is not actually drawn
		if (hours < 10)
			hours = "0" + hours;
		
		if (minutes < 10)
			minutes = "0" + minutes;

		var timeArray = new Array();
		for (var i = 0; i < hours.length; i++) {
			timeArray.push(hours.charAt(i));
		}

		for (var i = 0; i < minutes.length; i++) {
			timeArray.push(minutes.charAt(i));
		}
		arrayTime = timeArray; //Stores the array in another variable so it can be accessed elsewhere without calling the function again
		return timeArray;
	}

	//Converts the digits in the timeArray into path data
	convertToPath = function(timeArray) {
		var pathArray = new Array();
		var offset = toPixels(3); //The first digit is drawn three mm from the left side
		var commandArray = new Array();
		//Loops through the digits in timeArray
		for (var i = 0; i < timeArray.length; i++) {
			if (i == 0 && timeArray[i] == 0) { //If the first digit is 0 (if the hours < 10) AND the loop is on the first digit
				offset += toPixels(5); //Changes the offset so that the three digits that will be drawn will be centered
				commandArray.push(["Z"]); //The Z command, without a firstPoint value, will not draw anything, but can still be interpreted without errors
				colon = "M 118.73227,307.21546 Z M 118.73227,253.34648 Z"; //Changes the path data of the colon so that it will still be in the correct location
			}
			else {
				var data = pathData[timeArray[i]]; 
				var commands = parse(data);

				//Loops through the commands in the array and adds the offset to each x value
				for (var x = 0; x < commands.length; x++) {
					if (commands[x].code != 'Z' || commands[x].code != 'z') { //Every command but the close path commands have an x value
						commands[x].x += offset;
						if (commands[x].x1) //Some commands (curves and arcs) have an x1 value
							commands[x].x1 += offset;
						if (commands[x].x2) //Some commands (cubic curves) have an x2 value
							commands[x].x2 += offset;
					}
				}

				commandArray.push(commands);

				if (timeArray[0] != 0) 
					colon = "M 165.73227,300.21546 Z M 165.73227,253.34648 Z"; //Ensures that the colon has the correct path data
				//Without this check, once the hours changed from single to double digits, the colon would be in the incorrect place

				offset += toPixels(18); //Adds an offset to each digit
				//Each digit should be 15mm wide, with 3mm space between each digit
				if (i == 1)
					offset += toPixels(4); //Adds an extra 4mm of space to account for the colon
			}
		}

		return commandArray;
	}

	//Draws a circle to indicate the amount of time left in the minute
	timeCircle = function() {
		resetTimer();

		//Draws a circle, given an array of points and the amount of delay in between each point
	  	circle = function(array, timeDelay) { 
		    for (var i=0; i<array.length; i+=1) {
		      	point = array[i];
	      		doSetTimeout(point.x, point.y, -140, timeDelay);
	    	}
	  	}

	  	//Calculates the amount of time left in the minute, based on the difference between the time the erase function was called and the time the drawTime function ended
	  	calcTimeLeft = function() {
	  		difference += 1000; //Add some padding just to be safe
	  		return 60000 - difference; //Everything is in milliseconds to keep calculations simple
	  	}

	  	//Calculates the amount of delay between each point based on the amount of time left and the amount of points to draw
	  	calcDelay = function(timeLeft, points) {
	  		msPerPt = timeLeft / points;
	  		return msPerPt;
	  	}

	  	var radius = 53.5;
	  	var centerX = 0;
	  	var centerY = -5;
	  	var points = new Array();

	  	//Populates the array with points
	  	//Draws more than 360 points because it needs to go slightly over to align with the eraser hole
	  	for (var degree = 360; degree > -2; degree--) { 
	  		var radians = (degree + 90) * Math.PI/180; //Add 90 to degree so that the circle starts at the top, not at the right
			var x = centerX + radius * Math.cos(radians);
		    var y = centerY + radius * Math.sin(radians);
		    points.push({x:x,y:y});
	  	}

	  	setTimeout(function() { circle(points, calcDelay(calcTimeLeft(), points.length)) }, 0);
	}

	//Tells the time
	tellTime = function() {
		resetTimer();

		startTime = new Date().getTime();

		drawing.erase(function() {
			drawTime(convertToPath(getTheTime()), function() {
				timeCircle();
			});
		}); 

		//drawTime(convertToPath([0, 2, 4, 2]), console.log);
		//setTimeout(function() { drawTime(convertToPath(getTheTime())) }, 12500);
		//setTimeout(function() { drawTime(convertToPath([0, 8, 5, 8]))}, 12500);
		//setTimeout(function() { timeCircle() }, 12501);
	}

	tellTime();
	clockTimer = setInterval(function() { tellTime() }, 60000); //Repeat every 60 seconds
}

//A function to stop the clock
//The clock will finish erasing, drawing, and moving the arms in a circle, but it will not repeat
SVGReader.prototype.clearClock = function() {
	clearInterval(clockTimer);
	console.log("Stopping clock.");
}

//Says 'hello' in multiple languages
SVGReader.prototype.hello = function() {
	resetTimer();
	var fileArray = fs.readdirSync("./hello");
	var fileNum;
	objRef = this;

	//Used to access the erase functions
	var drawing = new draw.Draw({ 
		baseWidth: objRef.baseWidth,
		baseHeight: objRef.baseHeight,
		drawHeight: objRef.drawHeight
	});

	//Picks a file at random from a folder of 'hello's
	pickFile = function() {
		do {
			fileNum = Math.floor(Math.random() * fileArray.length);
		}
		while (fileNum == lastNum1 || fileNum == lastNum2); //Generates numbers until a number that has not been used in the past two calls is picked
		//A language can only be used every third time

		lastNum2 = lastNum1; //Adjusts the last two numbers used
		lastNum1 = fileNum;

		//Checks to see if the characters should be drawn connected or not
		//Specified in file name
		if (fileArray[fileNum].charAt(7) === 'T')
			connect = true;
		else
			connect = false;

		return "./hello/" + fileArray[fileNum];
	}

	//Says hello.
	sayHello = function() {
		resetTimer();
		var fileChoice = pickFile();
		drawing.erase(function() {
			setTimeout(function() { objRef.drawSVG(fileChoice, connect) }, 10000);
		});
	}

	sayHello();
	helloTimer = setInterval(function() { sayHello() }, 60000); //Repeat every minute
}

//A function to cancel saying hello
//The robot will finish writing/erasing if it has already started but after that it will stop
SVGReader.prototype.sayGoodbye = function() {
	clearInterval(helloTimer);
	console.log("Goodbye!"); 
}

//Cycles through all the languages rather than picking one at random
SVGReader.prototype.helloCycle = function() {
	resetTimer();
	var fileArray = fs.readdirSync("./hello");	
	objRef = this;
	var fileNum = 0;

	//Used to access the erase functions
	var drawing = new draw.Draw({ 
		baseWidth: objRef.baseWidth,
		baseHeight: objRef.baseHeight,
		drawHeight: objRef.drawHeight
	});

	//Function to actually write hello
	sayHello = function() {
		var fileChoice = "./hello/" + fileArray[fileNum]; 

		if (fileChoice.charAt(15) === 'T')
			connect = true;
		else
			connect = false;

		//drawing.erase(function() { 
		//	setTimeout(function() { objRef.drawSVG(fileChoice, connect) }, 10000);
		//});

		fileNum++;

		if (fileNum >= fileArray.length) //Once the end of the list is reached, stop writing
			clearInterval(helloTimer);
	}

	sayHello();
	helloTimer = setInterval(function() { sayHello() }, 60000);

}

//Saves the coordinates of the first point drawn
var firstPoint;

var objArr;
var pathArray;

var widthRatio;
var heightRatio;
var halfway;
var currentPoint;
var penHeight;
var delay, loaded, fontFile;
var transformX, transformY, objRef, connected, startTime, endTime, difference, clockTimer, firstMove, lastNum1, lastNum2, connect, baseWidth, baseHeight, defaultEaseType;

module.exports.SVGReader = SVGReader;
