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

    Note: This will draw complete circles. The end angle will be the same as the start angle.

    Example:
    { x: 0,
      y: 0,
      z: -158,
      radius: 20,
      startAngle: 0,
      anticlockwise: true,
      delay: 5,
      rotations: 5 }

## Draw an Arc:
    HTTP POST <robotURL>/arc

    x: Center of circle, millimeters (Number, float)
    y: Center of circle, millimeters (Number, float)
    z: Center of circle, millimeters (Number, float)
    radius: Radius of circle, millimeters (Number, float)
    startAngle: Starting angle, radians (Number, float)
    endAngle: Ending angle, radians (Number, float)
    anticlockwise: Set to true to go anticlockwise, false to go clockwise (Boolean)
    delay: Number of milliseconds of delay to add between each point (Number, integer)

    Note: This will draw one arc. If startAngle and endAngle are the same, it will draw one complete circle.
    If you want to draw more than one complete circle, use the "/circle" command.

    { x: 0,
      y: 0,
      z: -158,
      radius: 20,
      startAngle: 1.57,
      endAngle: 3.14,
      anticlockwise: false,
      delay: 5 }
