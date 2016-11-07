// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
// https://html.spec.whatwg.org/multipage/scripting.html#dom-context-2d-arc

var tau = Math.TAU = 2*Math.PI;

function areValid(arguments) {
  // Check for correct number of arguments
  if (arguments.length < 6) { return false; }
  if (arguments.length > 7) { return false; }

  // If any of the arguments are infinite or NaN, then abort.
  for (var parameter in arguments) {
    if (!isFinite(arguments[parameter])) { return false; }
    if (isNaN(arguments[parameter])) { return false; }
  }
  return true;
}

function calcPoint(cX, cY, r, radian) {
  var pointX = cX + r * Math.cos(radian);
  var pointY = cY + r * Math.sin(radian);
  return {x: pointX, y: pointY}
}

function arc(centerX, centerY, centerZ, radius, startAngle, endAngle, anticlockwise) {
  var arcPoints = [];

  if (!areValid(arguments)) return;

  // Test if anticlockwise was given. If not, set to false.
  if (typeof(anticlockwise) === "undefined") {
    var anticlockwise = false;
  } else {
    // Abort if not boolean
    if (typeof(anticlockwise) !== "boolean") {
      return;
    }
  }

  // Modulo angles into range
  startAngle = startAngle % tau;
  endAngle = endAngle % tau;

  var clockwise = !anticlockwise;
  if (clockwise === false) {
    // If needed, offset startAngle by one full turn so the loop works
    if (startAngle >= endAngle) {
      startAngle -= tau;
    }

    // Get all path points
    for (var radian = startAngle; radian <= endAngle; radian += .05) {
      var point = calcPoint(centerX, centerY, radius, radian);;
      arcPoints.push({x:point.x, y:point.y, z:centerZ})
    }
  } else {
    // If needed, offset startAngle by one full turn so the loop works
    if (startAngle <= endAngle) {
      startAngle += tau;
    }

    // Get all path points
    for (var radian = startAngle; radian >= endAngle; radian -= .05) {
      var point = calcPoint(centerX, centerY, radius, radian);
      arcPoints.push({x:point.x, y:point.y, z:centerZ})
    }
  }
  return arcPoints;
}


//-----------------------------------------------------
// Example #1: startAngle > endAngle, clockwise
//arc(0, 0, -140, 20, tau/2, tau/4, false);

// Example #2: startAngle > endAngle, anticlockwise
//arc(0, 0, -140, 20, tau/2, tau/4, true);

// Example #3: startAngle < endAngle, clockwise
//arc(0, 0, -140, 20, tau/4, tau/2, false);

// Example #4: startAngle < endAngle, anticlockwise
//arc(0, 0, -140, 20, tau/4, tau/2, true);

module.exports = arc;