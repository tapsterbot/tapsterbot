function AngryBirds(args) {
  this.drawHeight = -151;
  if (args) {
      var keys = Object.keys(args)
      keys.forEach(function(key){
          this[key] = args[key]
    }, this)
  }

  drawHeight = this.drawHeight;

};

move = function(x,y,z, when) {
  setTimeout(function(){ go(x,y,z) }, moveTimer);
  moveTimer += when;
}

resetMoveTimer = function() {
  moveTimer = 0;
}

var moveTimer = 0;

AngryBirds.prototype.playLevelOne = function(){
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

AngryBirds.prototype.playLevelTwo = function() {
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

AngryBirds.prototype.playLevelThree = function() {
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

AngryBirds.prototype.playLevels = function() {
  resetMoveTimer();
  var objRef = this;
  setTimeout(objRef.playLevelOne, 0);
  setTimeout(objRef.playLevelTwo, 15000);
  setTimeout(objRef.playLevelThree, 47500);  
  setTimeout(goToLevelOne, 65000);
}


AngryBirds.prototype.play_forever = function(){
    var objRef = this;
    console.log("Now playing forever...")
    this.playLevels();
    interval = setInterval(objRef.playLevels, 70000);
    return interval;
}

AngryBirds.prototype.stop_playing = function() {
  clearInterval(interval);
  console.log("No longer playing forever.");
}

module.exports.AngryBirds = AngryBirds;