var canvas = document.getElementById("canvas")

canvas.style.width = window.innerHeight * 1.5 + "px";
canvas.style.height = window.innerHeight + "px";  

var ctx = canvas.getContext('2d')

// Set actual size in memory (scaled to account for extra pixel density).
var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
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
    for (let i = 0; i < HEIGHT; i++) {

        //add new row to pixel array
        state.push([])

        for (let j = 0; j < WIDTH; j++) {
            complex = {
                x: REAL_SET.start + (j / WIDTH) * (REAL_SET.end - REAL_SET.start),
                y: IMAGINARY_SET.start + (i / HEIGHT) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
            }

            const [m, isMandelbrotSet] = mandelbrot(complex)
            let cIndex = isMandelbrotSet ? 0 : (m % colors.length - 1) + 1
            ctx.fillStyle = colors[cIndex]
            ctx.fillRect(j, i, 1, 1)

            //TODO store state of plot here
            let temp = isMandelbrotSet ? -1 : cIndex
            state[i].push(temp)
        }
    }

    finishedPlot = true
    console.log(state)
}

const MAX_ITERATION = 600
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

var reducedState = []

//loop through state and coalesce adjacent pixels with same value
function coalesce(){

    for(let i = 0; i < state.length; i++){
        
        //add new row
        reducedState.push([]);

        var last = state[i][0];
        var len = 0;

        for(let j = 0; j < state[i].length; j++){
            
            //check if new pixel has unique value
            if(state[i][j] == last){
                len++;
            }else{

                reducedState[i].push({last, len})

                len = 1;
                last = state[i][j]
            }
        }
        //push end of row
        reducedState[i].push({last, len})
        console.log("pushing end")
    }
    console.log(reducedState)
}

function draw(){

    console.log("drawing")

    for(let i = 0; i < reducedState.length; i++){

        sum = 0;

        for(let j = 0; j < reducedState[i].length; j++){

            

            //update colors if they aren't in the mandelbrot set
            if(reducedState[i][j].last != -1){

                //update color
                reducedState[i][j].last = (reducedState[i][j].last + 1) % colors.length

                ctx.fillStyle = colors[reducedState[i][j].last]
                ctx.fillRect(sum, i, reducedState[i][j].len, 1)
            }else{
                // sum -= reducedState[i][j].len
            }
            
            sum += reducedState[i][j].len
        }
    }
}

//do main calculation
calc()
coalesce()

var pause = setInterval(draw, 150);
var paused = false;

function Pause(){

    if(!paused){
        clearInterval(pause);
        paused = true;
        document.getElementById("pause").innerHTML = "Resume"
    }else{
        pause = setInterval(draw, 150);
        paused = false;
        document.getElementById("pause").innerHTML = "Pause"
    }
}


