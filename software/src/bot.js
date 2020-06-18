five = require("johnny-five");
kinematics = require("./kinematics");
svgRead = require("./SVGReader");
drawing = require("./draw");
arc = require("./arc");
motion = require("./motion");

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var jsonParser = bodyParser.json();

app.get('/', function (req, res) {
  res.send('Welcome to Tapster World!');
});

var servo1;
var servo2;
var servo3;

app.post('/go', jsonParser, function (req, res) {
  console.log('Go!');
  console.log(req.body);
  if ((typeof req.body.x === 'undefined') ||
     (typeof req.body.y === 'undefined') ||
     (typeof req.body.z === 'undefined')) {

     res.status(400).send('Invalid request\n');

  } else {
    var x = req.body.x;
    var y = req.body.y;
    var z = req.body.z;
    // Move with default easing
    go(x, y, z);

    // Move with no easing
    //go(x, y, z, 'none');

    setTimeout(function(){ res.send('OK\n') }, 250);
  }

});

app.post('/circle', jsonParser, function (req, res) {
  console.log('Circle!');
  console.log(req.body);
  if ((typeof req.body.x === 'undefined') ||
     (typeof req.body.y === 'undefined') ||
     (typeof req.body.z === 'undefined') ||
     (typeof req.body.radius === 'undefined') ||
     (typeof req.body.startAngle === 'undefined') ||
     (typeof req.body.anticlockwise === 'undefined') ||
     (typeof req.body.delay === 'undefined') ||
     (typeof req.body.rotations === 'undefined')) {

     res.status(400).send('Invalid request\n');

  } else {
    var centerX = req.body.x;
    var centerY = req.body.y;
    var centerZ = req.body.z;
    var radius = req.body.radius;
    var startAngle = req.body.startAngle;
    var anticlockwise = req.body.anticlockwise;
    var delay = req.body.delay;
    var rotations = req.body.rotations;

    // An array to save points on the arc
    var points = arc(centerX, centerY, centerZ, radius, startAngle, startAngle, anticlockwise);

    // Go to each point in the arc
    for (var rotation = 0; rotation < rotations; rotation += 1) {
      for (var i = 0; i < points.length; i += 1) {
        setTimeout( function(point) {
          go(point.x, point.y, point.z, "none")
        },
        i*delay + points.length*delay*rotation,
        points[i]);
      }
    }

    // Return
    setTimeout(function(){ res.send('OK\n') }, points.length*delay*rotations );
  }
});


app.post('/arc', jsonParser, function (req, res) {
  console.log('Arc!');
  console.log(req.body);
  if ((typeof req.body.x === 'undefined') ||
     (typeof req.body.y === 'undefined') ||
     (typeof req.body.z === 'undefined') ||
     (typeof req.body.radius === 'undefined') ||
     (typeof req.body.startAngle === 'undefined') ||
     (typeof req.body.endAngle === 'undefined') ||
     (typeof req.body.anticlockwise === 'undefined') ||
     (typeof req.body.delay === 'undefined')) {

     res.status(400).send('Invalid request\n');

  } else {
    var centerX = req.body.x;
    var centerY = req.body.y;
    var centerZ = req.body.z;
    var radius = req.body.radius;
    var startAngle = req.body.startAngle;
    var endAngle = req.body.endAngle;
    var anticlockwise = req.body.anticlockwise;
    var delay = req.body.delay;

    // An array to save points on the arc
    var points = arc(centerX, centerY, centerZ, radius, startAngle, endAngle, anticlockwise);

    // Go to each point in the arc
    var i;
    for (i = 0; i < points.length; i += 1) {
      setTimeout( function(point) { go(point.x, point.y, point.z, "none") }, i*delay, points[i]);
    }

    // Return
    setTimeout(function(){ res.send('OK\n') }, i*delay );
  }

});



// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.listen(port, function () {
  console.log('Tapster web server listening on port ' + port);
});


//If a filepath is specified, load that config
//Otherwise, resort to the default config
//> Usage:
//> node bot.js "C:\Projects\Tapsterbot\software\config.js"
if (process.argv[2]) {
  try {
    var config = require(process.argv[2]);
    console.log("Config found and loaded.");
  } catch (e) {
    console.log("Config not found. Loading default.");
    var config = require("../config.js");
  }
}
else {
  console.log("Config not specified. Loading default.");
  var config = require("../config.js");
}

//Alternate config loading code
//If a Tapster version is specified, load that config
//Otherwise resort to the default config
//> Usage:
//> node bot.js "Tapster-2-plus"

/*if (process.argv[2]) {
  try {
    var config = require("../" + process.argv[2] + ".js");
    console.log("Config found and loaded.");
  } catch (e) {
    console.log("Config not found. Loading default.");
    var config = require("../config.js");
  }
}
else {
  console.log("Config not specified. Loading default.");
  var config = require("../config.js");
} */

k = new kinematics.Kinematics({
  e: config.e,
  f: config.f,
  re: config.re,
  rf: config.rf
});

svg = new svgRead.SVGReader({
  baseWidth: config.baseWidth,
  baseHeight: config.baseHeight,
  drawHeight: config.drawHeight,
  delay: config.delay,
  defaultEaseType: config.defaultEaseType
});

draw = new drawing.Draw({
  baseWidth: config.baseWidth,
  baseHeight: config.baseHeight,
  drawHeight: config.drawHeight,
  defaultEaseType: config.defaultEaseType
});

board = new five.Board({
  debug: false
});

var steps = 5;
var delay = config.delay / steps;
var defaultEaseType = config.defaultEaseType;

current = [0, 0, -140];
timer = 0;

board.on("ready", function() {
    // Setup
    /*servo1 = five.Servo({
        address: 0x40,
        controller: "PCA9685",
        pin: 0,
        range: [35, 145] //Too high of a minimum input will cause issues with the forward kinematics
    });
    servo2 = five.Servo({
        address: 0x40,
        controller: "PCA9685",
        pin: 1,
        range: [35, 145]
    });
    servo3 = five.Servo({
        address: 0x40,
        controller: "PCA9685",
        pin: 2,
        range: [35, 145]
    }); */

  servo1 = new five.Servo({
      pin: 9,
      range: [0, 100]
  });

  servo2 = new five.Servo({
      pin: 10,
      range: [0, 100]
  });

  servo3 = new five.Servo({
      pin: 11,
      range: [0, 100]
  });

    board.repl.inject({
      servo1: servo1,
      s1: servo1,
      servo2: servo2,
      s2: servo2,
      servo3: servo3,
      s3: servo3,
    });

    // Move to starting point
    var max = 15;
    var min = 5;
    var range = max - min;
    servo1.to(15);
    servo2.to(15);
    servo3.to(15);

    /*
    var dance = function() {
      servo1.to(parseInt((Math.random() * range) + min, 10));
      servo2.to(parseInt((Math.random() * range) + min, 10));
      servo3.to(parseInt((Math.random() * range) + min, 10));
    };

    var dancer;

    start_dance = function() {
      if (!dancer) dancer = setInterval(dance, 250);
    }

    stop_dance = function() {
      if (dancer) {
        clearInterval(dancer);
        dancer = null;
      }
    }

    board.repl.inject({
      dance: start_dance,
      chill: stop_dance
    }); */


});

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

rotate = function(x,y) {
    var theta = -60;
    x1 = x * cos(theta) - y * sin(theta);
    y1 = y * cos(theta) + x * sin(theta);
    return [x1,y1]
}

reflect = function(x,y) {
    var theta = 0;
    x1 = x;
    y1 = x * sin(2*theta) - y * cos(2*theta);
    return [x1,y1]
}


// A sine function for working with degrees, not radians
sin = function(degree) {
    return Math.sin(Math.PI * (degree/180));
}

// A cosine function for working with degrees, not radians
cos = function(degree) {
  return Math.cos(Math.PI * (degree/180));
}

moveServosTo = function(x, y, z) {
  current = [x, y, z]
  reflected = reflect(x,y);
  rotated = rotate(reflected[0],reflected[1]);

  angles = k.inverse(rotated[0], rotated[1], z);

  servo1.to((angles[1]).map(config.servo1.in_min, config.servo1.in_max, config.servo1.out_min, config.servo1.out_max));
  servo2.to((angles[2]).map(config.servo2.in_min, config.servo2.in_max, config.servo2.out_min, config.servo2.out_max));
  servo3.to((angles[3]).map(config.servo3.in_min, config.servo3.in_max, config.servo3.out_min, config.servo3.out_max));
  console.log(angles);
}

go = function(x, y, z, easeType) {
  var pointB = [x, y, z];
  if (easeType == "none") {
    moveServosTo(pointB[0], pointB[1], pointB[2]);
    return; //Ensures that it doesn't move twice
  }

  else if (!easeType)
    easeType = defaultEaseType //If no easeType is specified, go with default (specified in config.js)

  //motion.move(current, pointB, steps, easeType, delay);
  var points = motion.getPoints(current, pointB, steps, easeType);

  for (var i = 0; i < points.length; i++) {
    setTimeout( function(point) { moveServosTo(point[0], point[1], point[2]) }, i * delay, points[i]);
  }
}

//Returns the coordinates of the end effector, based on the angles
//Using the map function messes up these values
//Simply passing in the original angles will return the correct coordinates
position = function() {
  return k.forward(servo1.last.degrees, servo2.last.degrees, servo3.last.degrees);
}

//A separate setTimeout method so that delays work properly
doSetTimeout = function(x, y, z, timeDelay, easing) {
  if (!easing)
    easing = defaultEaseType;

  setTimeout(function() { go(x, y, z, easing) }, timer);
  timer = timer + timeDelay;
};


resetTimer = function() {
  timer = 0;
}
