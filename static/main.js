const body = document.querySelector("body")
const container = document.querySelector(".container")
const carImage = document.querySelector(".car")
const frontLeftWheel = document.querySelector("#front-left-wheel")
const frontRightWheel = document.querySelector("#front-right-wheel")
const physicsWorker = new Worker('static/physics.js')

function onMouseMove(e) {
  physicsWorker.postMessage({ command: 'mouse', x: e.offsetX, y: e.offsetY })
}

physicsWorker.addEventListener('message', function (event) {
  // Handle updates received from the Web Worker
  const car = event.data.car
  // console.log("car", car)

  frontLeftWheel.style.rotate = `${car.wheelAngle}rad`
  frontRightWheel.style.rotate = `${car.wheelAngle}rad`

  carImage.style.left = `${car.x - carImage.clientWidth / 2}px`
  carImage.style.top = `${car.y - carImage.clientHeight / 2}px`
  carImage.style.rotate = `${car.r}rad`
})

function onMouseEnter(e) {
  physicsWorker.postMessage({
    command: 'start',
    x: carImage.clientWidth / 2 + 10,
    y: carImage.clientHeight / 2 + 10
  })
}

function onMouseLeave(e) {
  physicsWorker.postMessage({ command: 'stop' })
}