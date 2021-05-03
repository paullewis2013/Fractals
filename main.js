var canvas = document.getElementById("canvas")

canvas.style.width = window.innerHeight * 1.5 + "px";
canvas.style.height = window.innerHeight + "px";  

var ctx = canvas.getContext('2d')

// Set actual size in memory (scaled to account for extra pixel density).
var scale = 0.8//window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
canvas.width = Math.floor(window.innerHeight/2 * 1.5 * scale);
canvas.height = Math.floor(window.innerHeight/2 * scale);

const WIDTH = window.innerHeight/2 * 1.5 * scale
const HEIGHT = window.innerHeight/2 * scale

const REAL_SET = { start: -2, end: 1 }
const IMAGINARY_SET = { start: -1.25, end: 1.25 }

//solarized colors
const colors = [
    "#002b36",
    "#073642",
    // "586e75",
    // "#657b83",
    // "#839496",
    // "#93a1a1",
    // "#eee8d5",
    // "#fdf6e3",
    "#b58900",
    "#cb4b16",
    "#dc322f",
    "#d33682",
    "#6c71c4",
    "#268bd2",
    "#2aa198",
    "#859900"
]

//holds contents of pixel array
var state = []
var finishedPlot = false

function calc() {
    for (let i = 0; i < WIDTH; i++) {

        //add new row to pixel array
        state.push([])

        for (let j = 0; j < HEIGHT; j++) {
            complex = {
                x: REAL_SET.start + (i / WIDTH) * (REAL_SET.end - REAL_SET.start),
                y: IMAGINARY_SET.start + (j / HEIGHT) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
            }

            const [m, isMandelbrotSet] = mandelbrot(complex)
            let cIndex = isMandelbrotSet ? 0 : (m % colors.length - 1) + 1
            ctx.fillStyle = colors[cIndex]
            ctx.fillRect(i, j, 1, 1)

            //TODO store state of plot here
            let temp = isMandelbrotSet ? -1 : cIndex
            state[i].push(temp)
        }
    }

    finishedPlot = true
}

const MAX_ITERATION = 80
function mandelbrot(c) {
    let z = { x: 0, y: 0 }, n = 0, p, d;
    do {
        p = {
            x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
            y: 2 * z.x * z.y
        }
        z = {
            x: p.x + c.x,
            y: p.y + c.y
        }
        d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2))
        n += 1
    } while (d <= 2 && n < MAX_ITERATION)
    return [n, d <= 2]
}



//do main calculation
calc()
setInterval(draw2, 100)

// var draw = function(){

//     console.log("waiting")

//     if(finishedPlot) {
//         draw = draw2;
//     }
// }

function draw2(){

    console.log("drawing")

    for(let i = 0; i < state.length; i++){
        for(let j = 0; j < state[i].length; j++){

            if(state[i][j] != -1){
                //update color
                state[i][j] = (state[i][j] + 1) % colors.length

                ctx.fillStyle = colors[state[i][j]]
                ctx.fillRect(i, j, 1, 1)
            }
            
        }
    }
}



