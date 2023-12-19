import Ball from './ball.js'
import Car from './car.js'

let stopRequested = false
let mouse

onmessage = function (event) {
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
}

function startPhysicsLoop({ carWidth, ballWidth, screenWidth, screenHeight }) {
  let t0
  let dt = 0
  
  const ball = new Ball(3 * screenWidth / 4, screenHeight / 2, 0, 0, ballWidth / 2)

  // Start car in the center of the screen
  // Car's reference frame is on the rear axle
  const car = new Car(screenWidth / 2 - carWidth / 2, screenHeight / 2, 0, 0, 0, carWidth)

  function physicsLoop(t) {
    if (t0)
      dt = (t - t0) / 1000

    t0 = t

    // Calculate the next state of the car
    car.calculateCarStep(mouse, dt)

    ball.calculateWallCollision(screenWidth, screenHeight)
    ball.calculateCarCollision(car)
    ball.calculateBallStep(dt)

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
