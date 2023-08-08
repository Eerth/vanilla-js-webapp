let stopRequested = false
let mouse

self.addEventListener('message', function (event) {
  // Handle incoming messages from the main thread
  // For example, start the physics loop when receiving a 'start' message
  if (event.data.command === 'start') {
    stopRequested = false
    startPhysicsLoop(event.data)
  }
  else if (event.data.command === 'stop')
    stopRequested = true
  else if (event.data.command === 'mouse')
    mouse = event.data
})

/**
 * Calculate the angle of the front wheels with respect to the car's body based on the mouse position
 * @param {Object} car - Car object
 * @returns {Number} - Angle in radians
 */
function getWheelAngle(car) {
  // console.log("car angle", car.r * 180 / Math.PI)

  let angle = Math.atan2(mouse.y - car.y, mouse.x - car.x) - car.r

  // Wrap angle to [-PI, PI]
  if (angle > Math.PI)
    angle -= 2 * Math.PI
  else if (angle < -Math.PI)
    angle += 2 * Math.PI

  // Mirror angle if it's more than 90 degrees
  if (angle > Math.PI / 2)
    angle = Math.PI - angle
  else if (angle < -Math.PI / 2)
    angle = -Math.PI - angle

  // Max wheel angle is 45 degrees
  return Math.max(Math.min(angle, Math.PI / 4), -Math.PI / 4)
}

/**
 * Calculate the acceleration of the car based on the mouse position
 * @param {Object} car - Car object
 * @returns {Number} - Speed in m/s
 */
function getAcceleration(car) {
  const mouseDistance = (mouse.x - car.x) * Math.cos(car.r) + (mouse.y - car.y) * Math.sin(car.r)

  // Return 0 if the mouse is on the car
  if (mouseDistance < 0)
    return mouseDistance
  else if (mouseDistance < car.L)
    return 0
  else
    return mouseDistance - car.L
}

function calculateCarStep(car, dt) {
  if (!mouse)
    return car

  car.wheelAngle = getWheelAngle(car)
  // console.log("wheelAngle", car.wheelAngle * 180 / Math.PI)

  const acceleration = getAcceleration(car)
  // console.log("acceleration", acceleration)
  car.speed = 0.99 * car.speed + acceleration * dt

  car.x = car.x + car.speed * Math.cos(car.r) * dt
  car.y = car.y + car.speed * Math.sin(car.r) * dt
  car.r = car.r + car.speed * (Math.tan(car.wheelAngle) / car.L) * dt

  return car
}

function calculateBallStep(car, ball, dt) {
  // Calculate the ball's position in the car's reference frame
  const ballX = (ball.x - car.x) * Math.cos(car.r) + (ball.y - car.y) * Math.sin(car.r);
  const ballY = -(ball.x - car.x) * Math.sin(car.r) + (ball.y - car.y) * Math.cos(car.r);

  // Find the closest point on the car to the ball
  const closestX = Math.max(Math.min(ballX, car.L), 0);
  const closestY = Math.max(Math.min(ballY, car.L / 2), -car.L / 2);

  // Detect collision with the car
  if (Math.sqrt((ballX - closestX) ** 2 + (ballY - closestY) ** 2) < ball.R) {
    // Calculate the normal vector of the collision
    const collisionVectorLength = Math.sqrt((ballX - closestX) ** 2 + (ballY - closestY) ** 2);
    const normalX = (ballX - closestX) / collisionVectorLength;
    const normalY = (ballY - closestY) / collisionVectorLength;

    // Calculate the ball's velocity in the car's reference frame
    const ballDX = (ball.dx * Math.cos(car.r) + ball.dy * Math.sin(car.r));
    const ballDY = (-ball.dx * Math.sin(car.r) + ball.dy * Math.cos(car.r));

    // Incorporate car's speed into the collision response
    const relativeSpeed = car.speed - (ballDX * normalX + ballDY * normalY);
    const ballDXAfter = ballDX - 2 * relativeSpeed * normalX;
    const ballDYAfter = ballDY - 2 * relativeSpeed * normalY;

    // Calculate the ball's velocity in the world's reference frame
    ball.dx = ballDXAfter * Math.cos(car.r) - ballDYAfter * Math.sin(car.r);
    ball.dy = ballDXAfter * Math.sin(car.r) + ballDYAfter * Math.cos(car.r);

    // Move the ball outside of the car
    ball.x = car.x + (closestX + ball.R) * Math.cos(car.r) - closestY * Math.sin(car.r);
    ball.y = car.y + (closestX + ball.R) * Math.sin(car.r) + closestY * Math.cos(car.r);
  }

  // Update the ball's position
  ball.x += ball.dx * dt;
  ball.y += ball.dy * dt;

  return ball;
}

function startPhysicsLoop({carX, carY, carL, ballX, ballY, ballR}) {
  // Initialize variables and setup physics loop
  let t0
  let dt = 0

  // Initialize the car's state
  let car = { x: carX, y: carY, r: 0, speed: 0, wheelAngle: 0, L: carL }
  let ball = { x: ballX, y: ballY, dx: 0, dy: 0, R: ballR }

  function physicsLoop(t) {
    if (t0)
      dt = (t - t0) / 1000

    t0 = t

    // Calculate the next state of the car
    car = calculateCarStep(car, dt)

    ball = calculateBallStep(car, ball, dt)

    // Send updates back to the main thread
    self.postMessage({ car, ball })

    if (!stopRequested) {
      // Schedule the next iteration of the physics loop
      requestAnimationFrame(physicsLoop)
    }
  }

  // Start the physics loop
  requestAnimationFrame(physicsLoop)
}
