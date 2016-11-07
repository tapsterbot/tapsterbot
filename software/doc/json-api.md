## Go to any point:
    HTTP POST <robotURL>/go

    x: Center of circle, millimeters (Number, float)
    y: Center of circle, millimeters (Number, float)
    z: Center of circle, millimeters (Number, float)

    Example:
    { x: 0,
      y: 0,
      z: -144 }

## Draw a Circle:
    HTTP POST <robotURL>/circle

    x: Center of circle, millimeters (Number, float)
    y: Center of circle, millimeters (Number, float)
    z: Center of circle, millimeters (Number, float)
    radius: Radius of circle, millimeters (Number, float)
    startAngle: Starting angle, radians (Number, float)
    anticlockwise: Set to true to go anticlockwise, false to go clockwise (Boolean)
    delay: Number of milliseconds of delay to add between each point (Number, integer)
    rotations: Number of rotations (Number, integer)

    Example:
    { x: 0,
      y: 0,
      z: -158,
      radius: 20,
      startAngle: 0,
      anticlockwise: true,
      delay: 5,
      rotations: 5 }

### Draw an Arc:
    HTTP POST <robotURL>/arc

    x: Center of circle, millimeters (Number, float)
    y: Center of circle, millimeters (Number, float)
    z: Center of circle, millimeters (Number, float)
    radius: Radius of circle, millimeters (Number, float)
    startAngle: Starting angle, radians (Number, float)
    endAngle: Ending angle, radians (Number, float)
    anticlockwise: Set to true to go anticlockwise, false to go clockwise (Boolean)
    delay: Number of milliseconds of delay to add between each point (Number, integer)

    { x: 0,
      y: 0,
      z: -158,
      radius: 20,
      startAngle: 1.57,
      endAngle: 3.14,
      anticlockwise: false,
      delay: 5 }