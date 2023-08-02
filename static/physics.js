let stopRequested = false
let mouseOffset

self.addEventListener('message', function (event) {
  // Handle incoming messages from the main thread
  // For example, start the physics loop when receiving a 'start' message
  if (event.data.command === 'start') {
    stopRequested = false
    startPhysicsLoop(event.data.x, event.data.y)
  }
  else if (event.data.command === 'stop')
    stopRequested = true
  else if (event.data.command === 'mouse')
    mouseOffset = event.data
})

function startPhysicsLoop(x, y) {
  // Initialize variables and setup physics loop
  let t0
  let dt = 0

  const car = { x, y, r: 0, speed: 0, wheelAngle: 0 }

  // Run the physics loop
  function physicsLoop(t) {
    // Perform physics calculations
    if (t0)
      dt = (t - t0) / 1000

    t0 = t

    if (mouseOffset) {
      // Calculate the angle of the front wheels
      const angle = Math.atan2(mouseOffset.y - car.y, mouseOffset.x - car.x)
      
      // Max wheel angle is 45 degrees
      car.wheelAngle = Math.max(Math.min(angle, Math.PI / 4), -Math.PI / 4)

      // Difference between the car angle and the wheel angle
      const angleDiff = car.wheelAngle - car.r

      // Transform the mouse position to the car's coordinate system
      const mouseOffsetCar = {
        x: (mouseOffset.x - car.x) * Math.cos(car.r) - (mouseOffset.y - car.y) * Math.sin(car.r),
        y: (mouseOffset.x - car.x) * Math.sin(car.r) + (mouseOffset.y - car.y) * Math.cos(car.r)
      }

      car.speed = 0.99 * car.speed + 0.1 * mouseOffsetCar.x * dt

      // The car moves in the direction of the wheels
      car.r = car.r + 0.1 * car.speed * angleDiff * dt
      car.x = car.x + car.speed * Math.cos(car.wheelAngle) * dt
      car.y = car.y + car.speed * Math.sin(car.wheelAngle) * dt

      fps = 1 / dt

      // Send updates back to the main thread
      self.postMessage({ car, fps })
    }

    if (!stopRequested) {
      // Schedule the next iteration of the physics loop
      requestAnimationFrame(physicsLoop)
    }
  }

  // Start the physics loop
  requestAnimationFrame(physicsLoop)
}
