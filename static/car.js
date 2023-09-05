export default class Car {
  constructor(x, y, r, speed, wheelAngle, L) {
    this.x = x
    this.y = y
    this.r = r
    this.speed = speed
    this.wheelAngle = wheelAngle
    this.L = L
  }

  /**
 * Calculate the angle of the front wheels with respect to the car's body based on the mouse position
 * @param {Object} mouse - Mouse position
 * @returns {Number} - Angle in radians
 */
  getWheelAngle(mouse) {
    let angle = Math.atan2(mouse.y - this.y, mouse.x - this.x) - this.r

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
   * @param {Object} mouse - Mouse position
   * @returns {Number} - Acceleration in m/s^2
   */
  getAcceleration(mouse) {
    const mouseDistance = (mouse.x - this.x) * Math.cos(this.r) + (mouse.y - this.y) * Math.sin(this.r)

    // Return 0 if the mouse is on the car
    if (mouseDistance < 0)
      return mouseDistance
    else if (mouseDistance < this.L)
      return 0
    else
      return mouseDistance - this.L
  }

  calculateCarStep(mouse, dt) {
    if (!mouse)
      return

    this.wheelAngle = this.getWheelAngle(mouse)

    const acceleration = this.getAcceleration(mouse)
    this.speed = 0.99 * this.speed + acceleration * dt

    this.x = this.x + this.speed * Math.cos(this.r) * dt
    this.y = this.y + this.speed * Math.sin(this.r) * dt
    this.r = this.r + this.speed * (Math.tan(this.wheelAngle) / this.L) * dt
  }
}