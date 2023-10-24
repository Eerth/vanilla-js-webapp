export default class Ball {
  constructor(x, y, dx, dy, Radius) {
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.Radius = Radius
  }

  calculateWallCollision(screenWidth, screenHeight) {
    if (this.x - this.Radius <= 0 || this.x + this.Radius >= screenWidth)
      this.dx = -this.dx

    if (this.y - this.Radius <= 0 || this.y + this.Radius >= screenHeight)
      this.dy = -this.dy
  }

  calculateCarCollision(car) {
    // Calculate the ball's position in the car's reference frame
    const ballX = (this.x - car.x) * Math.cos(car.r) + (this.y - car.y) * Math.sin(car.r)
    const ballY = -(this.x - car.x) * Math.sin(car.r) + (this.y - car.y) * Math.cos(car.r)

    // Find the closest point on the car to the ball
    const closestX = Math.max(Math.min(ballX, car.L), 0)
    const closestY = Math.max(Math.min(ballY, car.L / 2), -car.L / 2)

    // Detect collision with the car
    if (Math.sqrt((ballX - closestX) ** 2 + (ballY - closestY) ** 2) < this.Radius) {
      // // Calculate the normal vector of the collision
      // const collisionVectorLength = Math.sqrt((ballX - closestX) ** 2 + (ballY - closestY) ** 2)
      // const normalX = (ballX - closestX) / collisionVectorLength
      // const normalY = (ballY - closestY) / collisionVectorLength

      // // Calculate the ball's velocity in the car's reference frame
      // const ballDX = (this.dx * Math.cos(car.r) + this.dy * Math.sin(car.r))
      // const ballDY = (-this.dx * Math.sin(car.r) + this.dy * Math.cos(car.r))

      // // Incorporate car's speed into the collision response
      // const relativeSpeed = car.speed - (ballDX * normalX + ballDY * normalY)
      // const ballDXAfter = ballDX - 2 * relativeSpeed * normalX
      // const ballDYAfter = ballDY - 2 * relativeSpeed * normalY

      // // Calculate the ball's velocity in the world's reference frame
      // this.dx = ballDXAfter * Math.cos(car.r) - ballDYAfter * Math.sin(car.r)
      // this.dy = ballDXAfter * Math.sin(car.r) + ballDYAfter * Math.cos(car.r)

      // Move the ball outside of the car
      this.x = car.x + (closestX + this.Radius) * Math.cos(car.r) - closestY * Math.sin(car.r)
      this.y = car.y + (closestX + this.Radius) * Math.sin(car.r) + closestY * Math.cos(car.r)
    }
  }

  calculateBallStep(dt) {
    // Update the ball's position
    this.x += this.dx * dt
    this.y += this.dy * dt
  }
}