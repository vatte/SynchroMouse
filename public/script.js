// import { Agent, Player } from "./Classes";
// const Player = require('./Classes')
// import { frechetDistance, rebalanceCurve, procrustesNormalizeCurve, shapeSimilarity } from "curve-matcher";
// import curveMatcher from "curve-matcher"
// import { makeid } from './utils';
const socket = io();
let room;

// MAIN VARIABLES FOR GAME MODES
let perfect = false
let comp = false
let pred = false
let versionPredictability
let qualityCompetence
let qualityPredictability
const $mainMenu = document.querySelector('#main-menu-button') 
// const $modeScreenButton = document.querySelector('#main-demo-button')
const $submitGameMode = document.querySelector('#form')
const $startDemo = document.querySelector('#startNow')
const $similarityM =  document.querySelector('#similarityMeasure')
const $distanceM = document.querySelector('#distanceMeasure')
const $similarNoRotM = document.querySelector('#similarNoRotMeasure')
const $backButton = document.querySelector('#goBack')
let roomName

let prevX
let prevY
let rotation = 0

let agentIdealPrevX
let agentIdealPrevY

let agentWavesPrevX
let agentWavesPrevY
let rotationAgent = 0

let urlParams
let admin =  false
let startTimerGame = undefined

let countStop = 0;

let distance
let distanceArray = []
let anglePlayerSource
let angleAgentSource

let startTimer = undefined

// SOURCES OF NOISE
let perlinNoise = false


// COMPETENCE VARIABLES
let meanCompetence
let stddevCompetence
let competenceValueList = []
let competenceAngle
let competenceVelocity
let competenceDistance
let distanceComp
let noiseXCompetence
let noiseYCompetence
let playerPosCompX
let playerPosCompY
let randomNumberInterval
let versionCompetence = 0

let jerkPlayer = 0;
let jerkAgent = 0;

let jerkXPlayer = 0;
let jerkYPlayer = 0;
let jerkXAgent = 0;
let jerkYAgent = 0;

let jerksXPlayer = [];
let jerksYPlayer = [];
let jerksXAgent = [];
let jerksYAgent = [];

// COMPETENCE/INCOMPETENCE PARAMETERS


// PREDICTABILITY VARIABLES
let predictabilityActive
let meanPredictability = 0.0
let stddevPredictability = 100
let stddevPredRad = Math.PI
let noiseXPredictability
let noiseYPredictability
let distancePred
let randomNumberIntervalPredic

let playerPosPredX
let playerPosPredY
let randomNumPred

let curvaturePlayer

let curvatureAgent



// const playerPositions = {
//     X: [],
//     Y: [],
//     angle: [],
// }
// const agentPositions = {
//     X: [],
//     Y: [],
//     angle: [],
//     velocity: []
// }

const playerPositionsCompetence = {
    X: [],
    Y: [],
    angle: [],
}
const agentPositionsCompetence = {
    X: [],
    Y: [],
    angle: [],
}

const playerPositionsPredictability = {
    X: [],
    Y: [],
    angle: [],
}
const agentPositionsPredictability = {
    X: [],
    Y: [],
    angle: [],
}

const agentFinalPosition = {
    X: [],
    Y: [],
    angle: [],
}

let timer = 0

let inter = 0
let competenceActive = false 
let randomPerlinNoise = false
let idealAngle
let idealVelocity 
let rotationDifference
let rotationDifferenceAIdeal
let rotationDifferenceAWaves

let xpos
let ypos

let velocityPlayer

let testLogic = false

// BEGINNING OF THE NEW PROGRAM
let mode = 0;
let prevMouseX
let prevMouseY
let times = 0
let score = 0
let testSmooth
let interval
let sliderCompetence
let competencePlayer = []
let sliderPredictability
let entropy
let smoothness
let frameP
let accelXPlayer = []
let accelYPlayer = []
let accelXAgent = []
let accelYAgent = []
let prevAccelerationX = 0
let prevAccelerationY = 0
let jerkX = 0
let jerkY = 0
let accel = 0
let smoothP
let currentPath
let stats
let currentTarget
let targetCounter = 0
let txt
let prevMouseX1
let prevMouseY1
let curvaturesAgent = []
let curvaturesPlayer = []
// let anglePlayerSource
// let angleAgentSource

let agentCounterMove = 0;
let playerCounterMove = 0; 

let agentAccel = []
const playerPositions = {
    X: [],
    Y: [],
    angle: [],
    velocity: [],
    acceleration: []
}
const agentPositions = {
    X: [],
    Y: [],
    angle: [],
    velocity: [],
    acceleration: [],
    jerk: [],
    distance: []
}

// MENU

function toggleScreen(id, toggle) {
    let element = document.getElementById(id)
    let display = (toggle) ? 'block': 'none'
    element.style.display = display
}

function startMenu() {
    toggleScreen('start-screen', false)
    toggleScreen('mode-screen', true)

    // demoGame()
}

function startDemo() {
    toggleScreen('mode-screen', false)
    toggleScreen('demo', true)

    socket.on('begin', function() {
        urlParams = new URLSearchParams(window.location.search);
        


        if(urlParams.has('room')) {
            room = urlParams.get('room');
            // Possibility of removing given new configuration.
            // Is the user entering an admin or a player.
             socket.emit('join_room', room)

        }
        // Tutorial page.
        if(urlParams.has('playground')) {
            // document.getElementById('info').style.opacity = '0';

            // function windowSizeChanged() {
            //     var width = document.getElementById('game').offsetWidth;
            //     var height = document.getElementById('game').offsetHeight;
            //     scaleFactor = Math.min(window.innerWidth / width, window.innerHeight / height);
            //     document.getElementById('game').style.transform = 'scale(' + scaleFactor + ')';
            //   }
              
            //   window.onresize = windowSizeChanged;
            //   windowSizeChanged();
        }
    })

}

function goBackMenu() {

    toggleScreen('mode-screen', true)
    toggleScreen('demo', false)
}

$backButton.addEventListener('click', goBackMenu)


$mainMenu.addEventListener('click', (e) => {
    startMenu()
})




function calculateAverage(array) {
    let total = 0
    let count = 0

    array.forEach(function(item, index) {
        total += item
        count++
    })

    return total / count
}


// Measurement of velocities

setInterval(() => {
    // competencePlayer.push(player.acc.mag())
}, 1000)


// BEGINNING OF THE OLD PROGRAM

const canvas=document.getElementById('canvas-demo')
const ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576



$backButton.addEventListener('click', goBackMenu)


$mainMenu.addEventListener('click', (e) => {
    startMenu()
})

let speedSelection = document.querySelector('#spdOptions')
let levelCompetence = document.querySelector('#competenceOptions')
let levelPredictability = document.querySelector('#predictabilityOptions')
let measureCompetenceType = document.querySelector('#measureCompetence')
let measurePredictabilityType = document.querySelector('#measurePredictability')
// $modeScreenButton.addEventListener('click', (e) => {
//     startDemo()

// })

$submitGameMode.addEventListener('submit', (e) => {
    

    e.preventDefault()
        

    if (levelCompetence.options[levelCompetence.selectedIndex].value === 'low' ) {
        // console.log('It works with comp')
        meanCompetence = 0.0
        stddevCompetence = 300.0
    } else if (levelCompetence.options[levelCompetence.selectedIndex].value === 'high') {
        // console.log('It works with comp1')
        meanCompetence = 0.0
        stddevCompetence = 100.0
    } else if (levelCompetence.options[levelCompetence.selectedIndex].value === 'none') {
        
        // console.log('It works with comp2')
    }

    if (levelPredictability.options[levelPredictability.selectedIndex].value === 'low' ) {
        // console.log('It works with pred')
        meanPredictability = 0.0
        stddevPredRad = Math.PI
    } else if (levelPredictability.options[levelPredictability.selectedIndex].value === 'high') {
        // console.log('It works with pred1')
        meanPredictability = 0.0
        stddevPredRad = Math.PI/4
    } else if (levelPredictability.options[levelPredictability.selectedIndex].value === 'none') {
        
        // console.log('It works with pred2')
    }

    if (measureCompetenceType.options[measureCompetenceType.selectedIndex].value === 'version1') {
        // console.log('It works with comp measure')
    }

    if (measurePredictabilityType.options[measurePredictabilityType.selectedIndex].value === 'version1') {
        // console.log('It works with comp measure')
    }

    // const urlTest = window.location.search
    // const result = urlTest.slice(0, urlTest.indexOf('?'))
    // console.log(`The URL is ${urlTest.split('?')} and the other is ${result}`)
    // let urlModified = new URLSearchParams(urlTest)
    startDemo()

})



$startDemo.addEventListener('click', newGame)




function baseVector(agent, player) {
    distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

        if (distance !== 0) {
            agent.angle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x) 
            agent.velocity = Math.min(distance, agent.maxVelocity )
        }
}

// let compMeasurementCounter = 0
let compMeasurement = 0
let gameStarted = false


let playing = false


function newGame() {

    prevX = 200
    prevY = 200

    agentIdealPrevX = 500
    agentIdealPrevY = 200
    agentWavesPrevX = 500
    agentWavesPrevY = 200
    // var urlParams = new URLSearchParams(window.location.search);
    urlParams = new URLSearchParams(window.location.search);
    room = urlParams.get('room')
    socket.emit('start', room)
    socket.on('beginGame', (roundBeginning) => {
        if (!roundBeginning) {
            // console.log("The experiment will begin")
            document.getElementById('timeRemaining').innerHTML = 'X'
        } else {
            gameStarted = true
            let timeRoundGame = 30
            document.getElementById('timeRemaining').innerHTML = timeRoundGame
            if (startTimerGame !== undefined)  {
             clearInterval(startTimer)   
            }
            startTimerGame = setInterval(() => {
                timeRoundGame --
                if (timeRoundGame <0) {
                    clearInterval(startTimerGame)
                    startTimerGame = undefined
                } else {
                     document.getElementById('timeRemaining').innerHTML = timeRoundGame
                }
            }, 1000);
        }
    })
    playing = true
    demoGame()
}

function calculateCurvature(speedX, speedY, accX, accY) {
    
    let curve  = Math.abs((speedX * accY) - (accX * speedY)) / ((((speedX) ** 2) + ((speedY) ** 2)) ** (3/2))

    return curve
}



function demoGame() {
    let mouseSpeedX = [];
    let mouseSpeedXMax = []
    let mouseSpeedYMax = []
    let mouseSpeedY = [];
    let speeds = [];
    let speeds2 = [];
    let prevMoveX = 0;
    let prevMoveY = 0;
    let prevMoveAgentX = 0;
    let prevMoveAgentY = 0;
    let prevSpeedX = 0
    let prevSpeedY = 0
    let random = Math.random()
    // let average = 0;
    // let average2 = 0;
    let targetX = canvas.width / 2 + 50;
    let targetY = canvas.height /2 + 50; 
    ctx.fillStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';

    // What happens when the human disconnects.
    socket.on('disconnected', function(socketId) {

    })
    
    setInterval(() => {
        // socket.emit('calculateMeasures', room)
    }, 1000);

    socket.on('scoresSimilar', ( similarityScore, distanceScore, predPersonScore, predAgentScore, similarityNoRotScore, distanceNoRotScore) => {
        console.log('ENTERED THE SCORES FUNCTION')
        $similarityM.innerHTML = `Competence: Shape: ${similarityScore}. Distance: ${distanceScore}`
        $similarNoRotM.innerHTML = `Competence: ShapeNoRot: ${similarityNoRotScore} Distance: ${distanceNoRotScore}`
        $distanceM.innerHTML = `Predictability: Human: ${predPersonScore}. Agent: ${predAgentScore}.`
        
    })


    socket.on('end', function( finish) {
        if (finish) {
            gameStarted = false
            console.log("The experiment is finished")
            document.getElementById('time').innerHTML = 'X'
            document.getElementById('timeRemaining').innerHTML = 'X'
        } else {
            let seconds = 10
            document.getElementById('time').innerHTML = seconds
            if (startTimer !== undefined)  {
             clearInterval(startTimer)   
            }
            startTimer = setInterval(() => {
                seconds --
                if (seconds <0) {
                    clearInterval(startTimer)
                    startTimer = undefined
                } else {
                     document.getElementById('time').innerHTML = seconds
                } 
            }, 1000);
        }
    })

    
    
    playerPositions["X"].push(200)
    let counterTest = 0
    
    
    let average = array => array.reduce((a, b) => a + b) / array.length;
    // let activateWaves = true
    
    setInterval(() => {
        testLogic = false
    }, 500);

    const game = new Game(canvas);

    if (game.mouse.x !== undefined && game.mouse.y !== undefined) {
        prevMoveX = game.mouse.x
        prevMoveY = game.mouse.y
    }

    

    game.render(ctx);
    // console.log(game)
    function animate() {
        ctx.clearRect(0,0, canvas.width, canvas.height)
        game.render(ctx,random, targetX, targetY);
        requestAnimationFrame(animate);
        speeds.push(game.player.speedX)
        speeds2.push(game.player.speedY)
        accelXPlayer.push(game.player.prevAccX)
        accelYPlayer.push(game.player.prevAccY)
        accelXAgent.push(game.agent.prevAccX)
        accelYAgent.push(game.agent.prevAccY)
        // mouseSpeedX.push((game.mouse.x - prevMoveX) / 17.77)
        // mouseSpeedY.push((game.mouse.y - prevMoveY) / 17.77)

        // mouseSpeedXMax.push(Math.abs((game.mouse.x - prevMoveX) / 17.77))
        // mouseSpeedYMax.push(Math.abs((game.mouse.y - prevMoveY) / 17.77))

        if (accelXPlayer.length >= 2) {
            jerkXPlayer = accelXPlayer[accelXPlayer.length - 1] - accelXPlayer[accelXPlayer.length -2]
            jerksXPlayer.push(accelXPlayer[accelXPlayer.length - 1] - accelXPlayer[accelXPlayer.length -2])
            
        }

        if (accelYPlayer.length >= 2) {
            jerkYPlayer = accelYPlayer[accelYPlayer.length - 1] - accelYPlayer[accelYPlayer.length -2]
            jerksYPlayer.push(accelYPlayer[accelYPlayer.length - 1] - accelYPlayer[accelYPlayer.length -2])
        }

        if (accelXAgent.length >= 2) {
            jerkXAgent = accelXAgent[accelXAgent.length - 1] - accelXAgent[accelXAgent.length -2]
            jerksXAgent.push(accelXAgent[accelXAgent.length - 1] - accelXAgent[accelXAgent.length -2])
        }

        if (accelYAgent.length >= 2) {
            jerkYAgent = accelYAgent[accelYAgent.length - 1] - accelYAgent[accelYAgent.length -2]
            jerksYAgent.push(accelYAgent[accelYAgent.length - 1] - accelYAgent[accelYAgent.length -2])
        }


        // if (game.agent.accX !== undefined) {
        //     jerkX = game.agent.accX - prevAccelerationX
        // }

        // if (game.agent.accY !== undefined) {
        //     jerkY = game.agent.accY - prevAccelerationY
        // }

        mouseSpeedX.push((game.mouse.x - prevMoveX))
        mouseSpeedY.push((game.mouse.y - prevMoveY))

        rotationAgent = Math.atan2(game.agent.collisionY - prevMoveAgentY, game.agent.collisionX - prevMoveAgentX) * 180.0 / Math.PI
        rotation = Math.atan2(game.mouse.y - prevMoveY, game.mouse.x, prevMouseX) * 180.0 / Math.PI
        mouseSpeedXMax.push(Math.abs((game.mouse.x - prevMoveX)))
        mouseSpeedYMax.push(Math.abs((game.mouse.y - prevMoveY)))

        // Calculate curvature

        // curvaturePlayer = calculateCurvature(game.player.speedX)


        if (game.player.prevAccX !== undefined && game.player.prevAccY !== undefined) {
            // if (game.player.speedX !== 0 || game.player.speedY !== 0) {
                curvaturePlayer = calculateCurvature(game.player.speedX, game.player.speedY, game.player.prevAccX, game.player.prevAccY)
                // console.log(`The speed X: ${game.player.speedX} speed Y: ${game.player.speedY} accelX: ${game.player.prevAccX} accelY: ${game.player.prevAccY} `)
                
                
                // console.log(`The curvature is: ${curvaturePlayer}`)
                
            // } else {
            //     curvaturePlayer = 0;
            // }

            // console.log(`The curvature of the player is: ${curvaturePlayer}`)

            // if (curvaturePlayer > 10) {
                // console.log(`The speed X: ${game.player.speedX} speed Y: ${game.player.speedY} accelX: ${game.player.prevAccX} accelY: ${game.player.prevAccY} `)
                // console.log(`The curvature is: ${curvaturePlayer}`)
            // }
            if (curvaturePlayer !== NaN) {
                curvaturesPlayer.push(curvaturePlayer)
            } else {
                console.log(`The function is working`)
            }

            // console.log(curvaturePlayer !== NaN)
            
            // console.log(curvaturePlayer)
            // console.log(curvaturePlayer)
        }

        if (game.agent.accX !== undefined && game.agent.accY !== undefined) {
            curvatureAgent = calculateCurvature(game.agent.speedX, game.agent.speedY, game.agent.prevAccX, game.agent.prevAccY)
            curvaturesAgent.push(curvatureAgent)
            // console.log(`The speed X: ${game.agent.speedX} speed Y: ${game.agent.speedY} accelX: ${game.agent.prevAccX} accelY: ${game.agent.prevAccY} `)
            // console.log(`The curvature of the agent is: ${curvatureAgent}`)
        }

        // console.log(`The difference between player and agent is: ${Math.abs(curvaturePlayer - curvatureAgent)}`)

        if (!game.player.movementDecision && game.player.prevMoveDec !== game.player.movementDecision) {
            
            // console.log(curvaturesPlayer)
            // console.log(`The max curvature of the PLAYER is: ${Math.max(...curvaturesPlayer)}`)
            // console.log(`This works~!!!!`)
            socket.emit('calculateMeasuresPlayer', room)
            curvaturesPlayer = []
        }

        //  console.log(`First condition: ${!game.player.movementDecision} and second condition: ${game.player.prevMoveDec !== game.player.movementDecision}`)


        

        if (!game.agent.movementDecision && game.agent.prevMoveDec !== game.agent.movementDecision) {
            socket.emit('calculateMeasuresAgent', room)
            curvaturesAgent = []
        }



        // console.log(`The max curvature of the agent is: ${Math.max(...curvaturesAgent)}`)
        
        
        // curvatureAgent = calculateCurvature(game.agent.speedX, game.agent.speedY, game.agent.accX, game.agent.accY)

        // console.log(`The acceleration of the agent in X is: ${game.agent.accX} and in Y: ${game.agent.accY}`)
        // console.log(`The curvature of the agent is: ${curvatureAgent}`)

        socket.emit('locationAgent', room,  game.agent.collisionX, game.agent.collisionY, rotationAgent, game.agent.speedX, game.agent.speedY,
        game.agent.prevAccX, game.agent.prevAccY, jerkXAgent, jerkYAgent);
        socket.emit('locationPlayer', room, game.player.collisionX, game.player.collisionY, rotation, game.player.speedX, game.player.speedY,
        game.player.prevAccX, game.player.prevAccY, jerkXPlayer, jerkYPlayer);

        // moveTextX.innerText = `Mouse Speed in X: ${game.mouse.x - prevMoveX}`
        // moveTextY.innerText = `Mouse Speed in Y: ${game.mouse.y - prevMoveY}`

        // if (game.agent.movementDecision === false) {
        //     socket.emit('calculateMeasures', room)
        // }

        prevMoveX = game.mouse.x
        prevMoveY = game.mouse.y

        prevMoveAgentX = game.agent.collisionX
        prevMoveAgentY = game.agent.collisionY
        prevAccelerationX = game.agent.accX
        prevAccelerationY = game.agent.accY
        // console.log(`The collision of the agent is: ${game.agent.collisionX} and ${game.agent.collisionY}`)
        // console.log(`The target of the agent is: ${targetX} and ${targetY}`)

    }
    animate();

    
    
    // MOUSE MOVEMENTS
    canvas.addEventListener('mousemove', function (event) {
        let mouseX = event.pageX - canvas.offsetLeft
        let mouseY = event.pageY - canvas.offsetTop
        document.getElementById("objectCoords-HAT").innerHTML = "Object Coordinates: " + mouseX  + ", " + mouseY;
        xpos = mouseX
        ypos = mouseY
        // prevX = mouseX
        // prevY = mouseY

        let rot = Math.atan2(mouseY - prevY, mouseX - prevX) * 180.0 / Math.PI;
        let dist = Math.sqrt(Math.pow(mouseY - prevY, 2) + Math.pow(mouseX - prevX, 2));
        // prevX = mouseX;
        // prevY = mouseY;
        // while(rotation - rot > 180) {
        //     rotation -= 360;
        // }
        // while(rot - rotation > 180) {
        //     rotation += 360;
        // }
        var smooth = Math.min(1, dist/50);
        rotation = smooth * rot + (1 - smooth) * rotation;
        // socket.emit('location', room, mouseX, mouseY, rotation);


        return {
            x: mouseX,
            y: mouseY
        }
    })

    

}






