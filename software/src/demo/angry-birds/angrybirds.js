var five = require("johnny-five")
var kin = require("./../../kinematics.js");
var config = require("./../../../config.js");

drawHeight = config.drawHeight;

board = new five.Board({
  debug: false
});

k = new kin.Kinematics({
  e: config.e,
  f: config.f,
  re: config.re,
  rf: config.rf
})

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

  servo1 = five.Servo({
      pin: 9,
      range: [0, 100]
  });

  servo2 = five.Servo({
      pin: 10,
      range: [0, 100]
  });

  servo3 = five.Servo({
      pin: 11,
      range: [0, 100]
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

rotate = function(x,y) {
    var theta = -60 * Math.PI / 180;
    x1 = x * Math.cos(theta) - y * Math.sin(theta);
    y1 = y * Math.cos(theta) + x * Math.sin(theta);
    return [x1,y1]
}

reflect = function(x,y) {
    var theta = 0;
    x1 = x;
    y1 = x * Math.sin(2*theta) - y * Math.cos(2*theta);
    return [x1,y1]
}

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

moveServosTo = function(x, y, z) {
  reflected = reflect(x,y);
  rotated = rotate(reflected[0],reflected[1]);

  angles = k.inverse(rotated[0], rotated[1], z);
 
  servo1.to((angles[1]).map(config.servo1.in_min, config.servo1.in_max, config.servo1.out_min, config.servo1.out_max));
  servo2.to((angles[2]).map(config.servo2.in_min, config.servo2.in_max, config.servo2.out_min, config.servo2.out_max));
  servo3.to((angles[3]).map(config.servo3.in_min, config.servo3.in_max, config.servo3.out_min, config.servo3.out_max));
  console.log(angles);
}

move = function(x,y,z, when) {
  setTimeout(function(){ moveServosTo(x,y,z) }, moveTimer);
  moveTimer += when;
}

resetMoveTimer = function() {
  moveTimer = 0;
}

var moveTimer = 0;

playLevelOne = function(){
    resetMoveTimer();
    move(-20, -3, drawHeight + 10, 0);
    move(-20, -3, drawHeight, 500);
    move(-35,-6, drawHeight,300);
    move(-35,-6, drawHeight + 10,400);
    move(-30,0, drawHeight + 10,400);

    move(42,-18, drawHeight + 10, 2800);
    move(42,-18, drawHeight - 3, 500);
    move(42, -18, drawHeight + 10, 500);    

    move(9,-13, drawHeight + 10, 3000);
    move(9,-13, drawHeight - 2, 300);
    move(9, -13, drawHeight + 10,300);
    move(0,0, drawHeight + 10,300);
}

playLevelTwo = function() {
  resetMoveTimer();
  move(-20, -3, drawHeight + 10, 500);
  move(-20, -3, drawHeight, 200);
  move(-35, -2, drawHeight, 300);
  move(-35, -2, drawHeight + 10, 300);
  move(-20, -3, drawHeight + 10, 15000);
  move(-20, -3, drawHeight - 1, 300);
  move(-35, -8, drawHeight, 400);
  move(-35, -8, drawHeight + 10, 300);

  move(42, -18, drawHeight + 10, 6000);
  move(42, -18, drawHeight - 3, 500);
  move(42, -18, drawHeight + 10, 500);

  move(9, -13, drawHeight + 10, 3000);
  move(9, -13, drawHeight - 2, 300);
  move(9, -13, drawHeight + 10, 300);
  move(0, 0, drawHeight + 10, 400);
}

playLevelThree = function() {
  resetMoveTimer();
  move(-20, -3, drawHeight + 10, 1000);
  move(-20, -3, drawHeight, 200);
  move(-25, -10, drawHeight, 350);
  move(-23, -6.5, drawHeight, 350); 
  move(-23, -6.5, drawHeight + 10, 350);

  move(42, -18, drawHeight + 10, 8000);
  move(42, -18, drawHeight - 3, 500);
  move(42, -18, drawHeight + 10, 500);
};

goToLevelOne = function() {
  resetMoveTimer();
  move(-14, -12, drawHeight + 10, 250);
  move(-14, -12, drawHeight - 2, 250);
  move(-14, -12, drawHeight + 10, 250);
  move(-48, 23, drawHeight + 10, 1000);
  move(-46, 23, drawHeight - 2, 1000);
  move(-48, 23, drawHeight + 10, 500);
  move(45, -18, drawHeight + 10, 500);
  move(41, -18, drawHeight - 4, 500);
  move(45, -18, drawHeight + 10, 500);
  move(0, 0, drawHeight + 10, 250);  
}

repeat = function(){
   move(4,-32,-140,0);
   move(4,-32,-149,300);
   move(4,-32,-140,600);
   move(0,0,-120,900);
}

playLevels = function() {
  resetMoveTimer();
  var objRef = this;
  setTimeout(objRef.playLevelOne, 0);
  setTimeout(objRef.playLevelTwo, 15000);
  setTimeout(objRef.playLevelThree, 47500);  
  setTimeout(goToLevelOne, 65000);
}


play_forever = function(){
    var objRef = this;
    console.log("Now playing forever...")
    this.playLevels();
    interval = setInterval(objRef.playLevels, 70000);
    return interval;
}

stop_playing = function() {
  clearInterval(interval);
  console.log("No longer playing forever.");
}