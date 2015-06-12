five = require("johnny-five");
ik = require("./ik");
board = new five.Board({
  debug: false
});

board.on("ready", function() {
    // Setup
    servo1 = five.Servo({
        pin: 9,
        range: [0,90]
    });
    servo2 = five.Servo({
        pin: 10,
        range: [0,90]
    });
    servo3 = five.Servo({
        pin: 11,
        range: [0, 90]
    });

    servo1.on("error", function() {
      console.log(arguments);
    })
    servo2.on("error", function() {
      console.log(arguments);
    })
    servo3.on("error", function() {
      console.log(arguments);
    })

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
    servo1.to(min);
    servo2.to(min);
    servo3.to(min);

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
    });


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


// TODO: pull out map values to config file or some other solution.
go = function(x, y, z) {
  reflected = reflect(x,y);
  rotated = rotate(reflected[0],reflected[1]);
  
  angles = ik.inverse(rotated[0], rotated[1], z);
  servo1.to((angles[1]).map( 0 , 90 , 8 , 90 ));
  servo2.to((angles[2]).map( 0 , 90 , 8 , 90 ));
  servo3.to((angles[3]).map( 0 , 90 , 8 , 90 ));
  console.log(angles);
}

position = function() {
  return ik.forward(servo1.last.degrees, servo2.last.degrees, servo3.last.degrees);
}

//Draws a square in order to ensure that everything is working properly
testSquare = function() {
  setTimeout(function() { go(-20, 20, -150); }, 0); //Top left 
  setTimeout(function() { go(20, 20, -150); }, 1000); //Top right
  setTimeout(function() { go(20, -20, -150); }, 2000); //Bottom right
  setTimeout(function() { go(-20, -20, -150); }, 3000); //Bottom left
  setTimeout(function() { go(-20, 20, -150); }, 4000); //Return to start position
}

//Draws a star to test that the Tapster bot is working properly
testStar = function() {
  setTimeout(function() { go(-20, -20, -140); }, 0); //Bottom left
  setTimeout(function() { go(0, 20, -140); }, 1000); //Top
  setTimeout(function() { go(20, -20, -140); }, 2000); //Bottom right
  setTimeout(function() { go(-20, 10, -140); }, 3000); //Left
  setTimeout(function() { go(20, 10, -140); }, 4000); //Right
  setTimeout(function() { go(-20, -20, -140); }, 5000); //Starting position
}

testCircle = function() {
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
  }

//Draws an arbitrary amount of spirals to test that the Tapster bot is working properly
testSpiral = function(spirals) {
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
}
