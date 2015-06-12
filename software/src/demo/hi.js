five = require("johnny-five");
bot = require("bot");
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

    bot.go(0, 0, -140);
  });

hi = function() {  
  setTimeout(function() { go(-20, 20, -150) }, 0);
  setTimeout(function() { go(-20, -20, -150) }, 250);
  setTimeout(function() { go(-20, 0, -150) }, 500);
  setTimeout(function() { go(-10, 0, -150) }, 750)  
  setTimeout(function() { go(-10, 20, -150) }, 1000);
  setTimeout(function() { go(-10, -20, -150) }, 1250);

  setTimeout(function() { go(-10, -20, -140) }, 1500);
  setTimeout(function() { go(-5, -20, -140) }, 1750)
  setTimeout(function() { go(-5, -20, -150) }, 2000);
  setTimeout(function() { go(-5, 0, -150) }, 2250);
  setTimeout(function() { go(-5, 0, -140) }, 2500);
  setTimeout(function() { go(-5, 10, -140) }, 2750);
  setTimeout(function() { go(-5, 10, -150) }, 3000);
  setTimeout(function() { go(-5, 15, -150) }, 3250);

  setTimeout(function() { go(-5, 20, -140) }, 3500);
  setTimeout(function() { go(5, 20, -140) }, 3750);
  setTimeout(function() { go(5, 20, -150) }, 4000);
  setTimeout(function() { go(5, -10, -150) }, 4250);
  setTimeout(function() { go(5, -10, -140) }, 4500);
  setTimeout(function() { go(5, -15, -140) }, 4750);
  setTimeout(function() { go(5, -15, -150) }, 5000);
  setTimeout(function() { go(5, -20, -150) }, 5250);
  setTimeout(function() { go(5, 0, -140) }, 5500);
 }
