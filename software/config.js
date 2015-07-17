var config = {}

//Side of end effector
//~~Do not touch~~
config.e = 34.64101615137754;  // Math.sqrt(3) * 10 * 2

//Side of top triangle
//~~Do not touch~~
config.f = 110.85125168440814; // Math.sqrt(3) * 32 * 2

//Length of parallelogram joint
//~~Do not touch~~
config.re = 153.5;             // 145 + 8.5

//Length of upper joint
//~~Do not touch~~
config.rf = 52.690131903421914; // Math.sqrt(52**2 + 8.5**2)

//Input ranges for servos
//~~Do not touch~~
config.servo1 = {in_min: 0, in_max: 90};
config.servo2 = {in_min: 0, in_max: 90};
config.servo3 = {in_min: 0, in_max: 90};

//Default output ranges for servos
//CHANGE THESE
config.servo1.out_min = 12;
config.servo1.out_max = 93;
config.servo2.out_min = 8;
config.servo2.out_max = 90;
config.servo3.out_min = 14;
config.servo3.out_max = 96;

//Dimensions of the base plate
config.baseHeight = 95;
config.baseWidth = 80;

//Default Z-Level of the pen
config.penHeight = -140;

//Default drawing height of the pen
config.drawHeight = -152.75;

//Delay for commands in SVGReader
//Note that some commands will take longer than this
//Default value is 150
config.delay = 200;

//The default easing type to be used
//When no easing is specified, this is the type that will be used
//"none" means that if no easing is specified, do not ease
//For a list of possible easing types, look in motion.js
config.defaultEaseType = "linear";

module.exports = config;