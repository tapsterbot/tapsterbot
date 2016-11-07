## Go to any point:
    HTTP POST <robotURL>/go

    x: center of circle, millimeters
    y: center of circle, millimeters
    z: center of circle, millimeters    
    
    Example:
    { x: 0, 
      y: 0, 
      z: -144 }

## Draw a Circle:
    HTTP POST <robotURL>/circle

    x: center of circle, millimeters
    y: center of circle, millimeters
    z: center of circle, millimeters
    radius: radius of circle in millimeters
    startAngle: in radians,
    anticlockwise: boolean (true or false)
    delay: number of milliseconds of delay to add between each point
    rotations: number of rotations to perform, integer     
    
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
    
    x: center of circle, millimeters
    y: center of circle, millimeters
    z: center of circle, millimeters
    radius: radius of circle in millimeters
    startAngle: in radians,
    endAngle: in radians,    
    anticlockwise: boolean (true or false)
    delay: number of milliseconds of delay to add between each point      
    
    { x: 0,
      y: 0,
      z: -158,
      radius: 20,
      startAngle: 1.57,
      endAngle: 3.14,
      anticlockwise: false,
      delay: 5 }