const body = document.querySelector("body")
const container = document.querySelector(".container")
const carImage = document.querySelector(".car")
const ballImage = document.querySelector(".ball")
const frontLeftWheel = document.querySelector("#front-left-wheel")
const frontRightWheel = document.querySelector("#front-right-wheel")
const physicsWorker = new Worker('static/physics.js')

function onMouseMove(e) {
  physicsWorker.postMessage({ command: 'mouse', x: e.clientX, y: e.clientY })
}

physicsWorker.addEventListener('message', function (event) {
  // Handle updates received from the Web Worker
  const car = event.data.car
  const ball = event.data.ball
  // console.log("car", car)

  frontLeftWheel.style.rotate = `${car.wheelAngle}rad`
  frontRightWheel.style.rotate = `${car.wheelAngle}rad`

  ballImage.style.left = `${ball.x}px`
  ballImage.style.top = `${ball.y}px`

  carImage.style.left = `${car.x}px`
  carImage.style.top = `${car.y - carImage.clientHeight/2}px`
  carImage.style.rotate = `${car.r}rad`

  ballImage.style.visibility = 'visible'
  carImage.style.visibility = 'visible'
})

function onMouseEnter(e) {
  // Start car in the center of the screen
  // Car's reference frame is on the rear axle
  physicsWorker.postMessage({
    command: 'start',
    carX: body.clientWidth / 2 - carImage.clientWidth / 2,
    carY: body.clientHeight / 2,
    carL: carImage.clientWidth,
    ballX: 3 * body.clientWidth / 4,
    ballY: body.clientHeight / 2,
    ballR: ballImage.clientWidth / 2,
  })
}

function onMouseLeave(e) {
  physicsWorker.postMessage({ command: 'stop' })
}