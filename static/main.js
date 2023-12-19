const body = document.querySelector("body")
const container = document.querySelector(".container")
const carImage = document.querySelector(".car")
const ballImage = document.querySelector(".ball")
const frontLeftWheel = document.querySelector("#front-left-wheel")
const frontRightWheel = document.querySelector("#front-right-wheel")
const physicsWorker = new Worker('static/physics.js', { type: 'module' })

function handleStart(e) {
  const screenWidth = body.clientWidth
  const screenHeight = body.clientHeight
  const carWidth = carImage.clientWidth
  const ballWidth = ballImage.clientWidth

  physicsWorker.postMessage({ command: 'start', carWidth, ballWidth, screenWidth, screenHeight })
}

function handleMove(e) {
  const x = e.touches ? e.touches[0].clientX : e.clientX
  const y = e.touches ? e.touches[0].clientY : e.clientY

  physicsWorker.postMessage({ command: 'mouse', x, y })
}

function handleStop(e) {
  physicsWorker.postMessage({ command: 'stop' })
}

body.onmouseenter = handleStart
body.ontouchstart = handleStart

body.onmousemove = handleMove
body.ontouchmove = handleMove

body.onmouseleave = handleStop
body.ontouchend = handleStop

physicsWorker.addEventListener('message', function (event) {
  // Handle updates received from the Web Worker
  const car = event.data.car
  const ball = event.data.ball
  // console.log("car", car)

  frontLeftWheel.style.rotate = `${car.wheelAngle}rad`
  frontRightWheel.style.rotate = `${car.wheelAngle}rad`

  ballImage.style.left = `${ball.x - ballImage.clientWidth / 2}px`
  ballImage.style.top = `${ball.y - ballImage.clientHeight / 2}px`

  carImage.style.left = `${car.x}px`
  carImage.style.top = `${car.y - carImage.clientHeight / 2}px`
  carImage.style.rotate = `${car.r}rad`

  // ballImage.style.visibility = 'visible'
  carImage.style.visibility = 'visible'
})