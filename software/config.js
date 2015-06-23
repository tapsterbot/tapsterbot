var config = {}

//Side of end effector
config.e = 34.64101615137754;  // Math.sqrt(3) * 10 * 2

//Side of top triangle
config.f = 110.85125168440814; // Math.sqrt(3) * 32 * 2

//Length of parallelogram joint
config.re = 153.5;             // 145 + 8.5

//Length of upper joint
config.rf = 52.690131903421914; // Math.sqrt(52**2 + 8.5**2)

//Calibrated servo values
config.servo1 = {in_min: 0, in_max: 90, out_min: 11, out_max: 92};
config.servo2 = {in_min: 0, in_max: 90, out_min: 9, out_max: 88};
config.servo3 = {in_min: 0, in_max: 90, out_min: 10, out_max: 90.5};

//Dimensions of the base plate
config.baseHeight = 95;
config.baseWidth = 80;

//Default Z-level of the pen
config.penHeight = -140;

module.exports = config;
