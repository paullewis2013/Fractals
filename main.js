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

var REAL_SET = { start: -2, end: 1 }
var IMAGINARY_SET = { start: -1.25, end: 1.25 }


//solarized colors
// var colorCount = 10;
var colors = [];
var colorsMap = [
    {show:1, color:"#002b36"},
    {show:1, color:"#073642"},

    {show:0, color:"#586e75"},
    {show:0, color:"#657b83"},
    {show:0, color:"#839496"},
    {show:0, color:"#93a1a1"},
    {show:0, color:"#eee8d5"},
    {show:0, color:"#fdf6e3"},
    
    // "#586e75",
    // "#657b83",
    // "#839496",
    // "#93a1a1",
    // "#eee8d5",
    // "#fdf6e3",

    {show:1, color:"#b58900"},
    {show:1, color:"#cb4b16"},
    {show:1, color:"#dc322f"},
    {show:1, color:"#d33682"},
    {show:1, color:"#6c71c4"},
    {show:1, color:"#268bd2"},
    {show:1, color:"#2aa198"},
    {show:1, color:"#859900"},


    // "#b58900",
    // "#cb4b16",
    // "#dc322f",
    // "#d33682",
    // "#6c71c4",
    // "#268bd2",
    // "#2aa198",
    // "#859900"
]
function mapColors(){
    colors = [];
    for(let i = 0; i < colorsMap.length; i++){
        if(colorsMap[i].show == 1){
            colors.push(colorsMap[i].color)
        }
    }
    console.log(colors)
}
mapColors()

//holds contents of pixel array
var state = []
var finishedPlot = false

function calc() {

    state = [];

    for (let i = 0; i < HEIGHT; i++) {

        //add new row to pixel array
        state.push([]);

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

var MAX_ITERATION = 80
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
var animationLoad = 0;

//loop through state and coalesce adjacent pixels with same value
function coalesce(){

    reducedState = []
    animationLoad = 0;

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
                animationLoad++

                len = 1;
                last = state[i][j]
            }
        }
        //push end of row
        reducedState[i].push({last, len})
        animationLoad++
        // console.log("pushing end")
    }
    // console.log(reducedState)
    document.getElementById("anim").innerHTML = `Animation Load: ${animationLoad}`
}

function draw(){

    console.log("drawing")

    for(let i = 0; i < reducedState.length; i++){

        sum = 0;

        for(let j = 0; j < reducedState[i].length; j++){

            //this line shouldn't be here but breaks things in fun ways if uncommented and other parameters are adjusted
            // sum += reducedState[i][j].len

            //update colors if they aren't in the mandelbrot set
            if(reducedState[i][j].last != -1){

                //update color
                reducedState[i][j].last = (reducedState[i][j].last + 1) % colors.length

                ctx.fillStyle = colors[reducedState[i][j].last]
                ctx.fillRect(sum, i, reducedState[i][j].len, 1)
            }
            
            sum += reducedState[i][j].len
        }
    }
}

//do first calculation
calc()
coalesce()
updateBounds()
document.getElementById("iter").innerHTML = `Max iteration count: ${MAX_ITERATION}`

//for syncing animation to a song
var bpm = 120;
var pulsesPerBeat = 1;
var callrate = (1000/pulsesPerBeat)/(bpm/60)

var pauseInt = setInterval(draw, callrate);
var paused = false;

function updateBPM(){
    bpm = document.getElementById("BPM").value
    pulsesPerBeat = document.getElementById("BPMpulses").value
    callrate = (1000/pulsesPerBeat)/(bpm/60)
    pause();
    pause();
}

function pause(){

    if(!paused){
        clearInterval(pauseInt);
        paused = true;
        document.getElementById("pause").innerHTML = "Resume"
    }else{
        pauseInt = setInterval(draw, callrate);
        paused = false;
        document.getElementById("pause").innerHTML = "Pause"
    }
}

function reset(){

    if(!paused){
        pause();
    }
    refreshColors()

    REAL_SET = { start: -2, end: 1 }
    IMAGINARY_SET = { start: -1.25, end: 1.25 }

    MAX_ITERATION = 80
    document.getElementById("iter").innerHTML = `Max iteration count: ${MAX_ITERATION}`

    calc()
    coalesce()

    pause()

}


//zoom in
function zoom(x,y,factor){
    
    if(!paused){
        pause();
    }

    let realSize = Math.abs(REAL_SET.start - REAL_SET.end)
    let imaginarySize = Math.abs(IMAGINARY_SET.start - IMAGINARY_SET.end)

    REAL_SET.start = x - realSize/(factor * factor)
    REAL_SET.end = x + realSize/(factor * factor)
    IMAGINARY_SET.start = y - imaginarySize/(factor * factor)
    IMAGINARY_SET.end = y + imaginarySize/(factor * factor)

    MAX_ITERATION = Math.floor(MAX_ITERATION * 1.2);
    document.getElementById("iter").innerHTML = `Max iteration count: ${MAX_ITERATION}`
    if(MAX_ITERATION > 2000){
        MAX_ITERATION = 2000;
    }

    calc()
    coalesce()
    updateBounds()

    pause()
}

function updateBounds(){
    document.getElementById("rCoords").innerHTML = `Real Set Bounds {\n\t${REAL_SET.start},\n\t${REAL_SET.end}\n}`
    document.getElementById("iCoords").innerHTML = `Imaginary Set Bounds {\n\t${IMAGINARY_SET.start},\n\t${IMAGINARY_SET.end}\n}`
}

canvas.addEventListener('click', function(e){

    complex = {
        x: REAL_SET.start + (e.offsetX / WIDTH) * (REAL_SET.end - REAL_SET.start),
        y: IMAGINARY_SET.start + (e.offsetY / HEIGHT) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
    }

    let zf = document.getElementById("zoomFactor").value
    console.log(zf)
    zoom(complex.x, complex.y, zf)

});

function styleButtons(){
    
    for(let i = 0; i < colorsMap.length; i++){
        let check = document.getElementById("c" + i);
        check.style.backgroundColor = colorsMap[i].color
    }
}
styleButtons()

function refreshColors(){

    //update mapping
    for(let i = 0; i < colorsMap.length; i++){
        let check = document.getElementById("c" + i);
        if(check.checked){
            colorsMap[i].show = 1
        }else{
            colorsMap[i].show = 0
        }
    }

    // pause();
    //call function to map Colors
    mapColors();
    // pause();


    for(let i = 0; i < reducedState.length; i++){
        for(let j = 0; j < reducedState[i].length; j++){
            reducedState[i][j].last = reducedState[i][j].last%colors.length;
        }
    }
}