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



const playerPositions = {
    X: [],
    Y: [],
    angle: [],
}
const agentPositions = {
    X: [],
    Y: [],
    angle: [],
    velocity: []
}

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

const canvas=document.getElementById('canvas-demo')
const ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576


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
// let playerPosCompX
// let playerPosCompY

// let competenceInterval = setInterval(() => {
//     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
//     competencyAmount = getNormallyDistributedRandomNumber(distance,stddevCompetence)
//     competenceValueList.push(competencyAmount)
//     if (competencyAmount !== 0) {
//         idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
//         agent.angle = idealAngle
//         competenceVelocity =  Math.min(competencyAmount, agent.maxVelocity )
//         agent.velocity = competenceVelocity
//     }

//     // agent.velocity = competencyAmount
// }, 1000)

// competenceInterval


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

function initializeGame() {
    
}

function calculateDistVelocityAngle(player, agent) {
    let distance
    let angle
    let velocity

    distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
    angle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    velocity =  Math.min(distance, agent.maxVelocity )

    return {distance, angle, velocity}
}

function calculateNoise(meanParamComp, stdDevParamComp, meanParamCompRad, stdDevParamCompRad, meanParamPred, stdDevParamPred) {
    let noiseFactorCompetenceVelocity = getNormallyDistributedRandomNumber(meanParamComp,stdDevParamComp)
    let noiseFactorCompetenceAngle = getNormallyDistributedRandomNumber(meanParamCompRad, stdDevParamCompRad)
    let noiseFactorPredictability = getNormallyDistributedRandomNumber(meanParamPred,stdDevParamPred)

    return { noiseFactorCompetenceVelocity, noiseFactorCompetenceAngle, noiseFactorPredictability}
}

function calculateDistVelocityAngleWithNoise(player, agent, withNoise) {
    let distance
    let angle
    let velocity

    distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
    angle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    velocity =  Math.min(distance, agent.maxVelocity )

    if (withNoise) {
        // angle -= Math.PI/4
        // angle = Math.atan2(player.position.y - 0, player.position.x - 0) + Math.PI/4
        // console.log(angle)
        // velocity -=5

    }
   
    return {distance, angle, velocity}
}

function demoGame() {

    

    // What happens when the human disconnects.
    socket.on('disconnected', function(socketId) {

    })
    
    setInterval(() => {
        socket.emit('calculateMeasures', room)
    }, 1000);

    socket.on('scoresSimilar', ( similarityScore, distanceScore, predPersonScore, predAgentScore, similarityNoRotScore, distanceNoRotScore) => {
        console.log('ENTERED THE SCORES FUNCTION')
        $similarityM.innerHTML = `Competence: Shape: ${similarityScore}. Distance: ${distanceScore}`
        $similarNoRotM.innerHTML = `Competence: ShapeNoRot: ${similarityNoRotScore} Distance: ${distanceNoRotScore}`
        $distanceM.innerHTML = `Predictability: Human: ${predPersonScore}. Agent: ${predAgentScore}.`
        
    })


    socket.on('end', function( finish) {
        if (finish) {
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
    
    // LOGIC FOR PARAMETERS OF COMPETENCE AND PREDICTABILITY
    // if (!perfect) {
    //     meanCompetence = 0.0
    //     meanPredictability = 0.0
    //     if (comp && pred) {
    //         stddevCompetence = 100.0
    //         stddevPredRad = Math.PI/4
    //     } else if (comp && !pred) {
    //         stddevCompetence = 100.0
    //         stddevPredRad = Math.PI
    //     } else if (!comp && pred) {
    //         stddevCompetence = 300.0
    //         stddevPredRad = Math.PI/4
    //     } else if (!comp && !pred) {
    //         stddevCompetence = 300.0
    //         stddevPredRad = Math.PI
    //     }
    // }

    let competenceParameter = 700
    let predictabilityParameter = 700
    // setInterval(() => {
    //     setInterval(() => {
    //         agentDemo.angle = idealAngle + Math.PI/4
    //         agentDemo.velocity = idealVelocity
    //     }, competenceParameter); 
    // }, 1000);
    let average = array => array.reduce((a, b) => a + b) / array.length;
    let activateWaves = true
    // setInterval(() => {
    //     if (activateWaves) {
    //         activateWaves = false
    //     } else {
    //         activateWaves= true
    //     }
    //     console.log(`The difference in the angles are:${(angleAgentSource * ((180 / Math.PI)))-(anglePlayerSource * ((180 / Math.PI)))}`)
    // }, 500);
    setInterval(() => {
        testLogic = false
    }, 500);
    setInterval(() => {
        testLogic = true
        // agentDemo.velocity = total / agentPositions['velocity'].length;
        // agentDemo.angle = average(agentPositions['angle'])* Math.random()
        // console.log(`The ideal angle is: ${idealAngle}`)
        
        // console.log(agentPositions['velocity'])
        // console.log(average(agentPositions['velocity']))
        // agentDemo.velocity = idealVelocity
        // agentDemo.velocity = average(agentPositions['velocity']) * Math.random()
        // agentDemo.velocity = getNormallyDistributedRandomNumber(idealVelocity, 5)
    }, competenceParameter);

    setInterval(() => {
        // agentDemo.angle = getNormallyDistributedRandomNumber(idealAngle, Math.PI/2)
        // agentDemo.angle = idealAngle
        // console.log(`The difference between the angles is: ${idealAngle-getNormallyDistributedRandomNumber(idealAngle, Math.PI/2)}`)
    }, predictabilityParameter);

    // ANOTHER INTERVAL ALGORITHM === VERSION 4 NOT WORKING

    // let counterPlayerBefore
    // setInterval(() => {
    //     counterPlayerBefore = playerPositions["X"].length-1
    //     console.log("The length of: " + playerPositions["X"].length)
    //     inter= 0
    //     if (competenceActive) {
    //         competenceActive = false
    //     } else {
    //         competenceActive = true
    //         stddevCompetence = 300
    //     let playerPosCompX2 = getNormallyDistributedRandomNumber(player.position.x, stddevCompetence)

    //     let playerPosCompY2 = getNormallyDistributedRandomNumber(player.position.y, stddevCompetence)


    //     let supposedAngle
    //     // let agentPosCompX2 = getNormallyDistributedRandomNumber(agent.position.x,stddevCompetence)
    //     // let agentPosCompY2 = getNormallyDistributedRandomNumber(agent.position.y, stddevCompetence)
    //     distanceComp = Math.sqrt(((playerPosCompX2 - agent.position.x) ** 2) + ((playerPosCompY2 - agent.position.y) ** 2))
    //     competenceVelocity =  Math.min(distanceComp, agent.maxVelocity )
    //     idealAngle = Math.atan2(playerPosCompY2 - agent.position.y, playerPosCompX2 - agent.position.x)
    //     let i = 1000/(33.34/2)
    //     let currentPositionX= agent.position.x
    //     let currentPositionY = agent.position.y
    //     let currentVelocity = competenceVelocity
    //     let currentAngle = idealAngle
    //     let counter2 = 0
        
    //     while (i > 0) {
    //         agentPositionsCompetence["X"].push(currentPositionX +(currentVelocity *Math.cos(currentAngle)))
    //         agentPositionsCompetence["Y"].push(currentPositionY +(currentVelocity *Math.sin(currentAngle)))

    //         currentPositionX = currentPositionX +(currentVelocity *Math.cos(currentAngle))
    //         currentPositionY = currentPositionY +(currentVelocity *Math.sin(currentAngle))

    //         i --
    //         counter2 ++
    //     }
    //     }
    // }, 1000);

    // INTERVAL DEFINED FOR THE ALGORITHM COMPETENCE ====== WORKING
    // randomNumberInterval = Math.random()* 1000
    // setInterval(() => {
        
    //     if (competenceActive) {
    //         competenceActive = false
    //     } else if (!competenceActive) {
    //         competenceActive = true

    //         noiseXCompetence= getNormallyDistributedRandomNumber(meanCompetence,stddevCompetence)
    //         noiseYCompetence = getNormallyDistributedRandomNumber(meanCompetence,stddevCompetence)
    //         // console.log("The noise in x is: "+  noiseXCompetence + " The noise in y is: " + noiseYCompetence)

    //         // playerPosCompX = getNormallyDistributedRandomNumber(player.position.x,stddevCompetence)

    //         // playerPosCompY = getNormallyDistributedRandomNumber(player.position.y,stddevCompetence)

    //         distanceComp = Math.sqrt((((player.position.x + noiseXCompetence) - agent.position.x) ** 2) + (((player.position.y + noiseYCompetence) - agent.position.y) ** 2))
    //         idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    //         competenceVelocity =  Math.min(distanceComp, agent.maxVelocity )
    //     }
    //     // console.log("CompetenceActive is: " + competenceActive)
    //     randomNumberInterval = Math.random()* 1000
    //     // console.log("The next interval will be: " + randomNumberInterval)
    // },randomNumberInterval)


    // INTERVAL DEFINED FOR THE PREDICTABILITY ALGORITHM ====== WORKS
    // randomNumberIntervalPredic = Math.random()* 1000
    // setInterval(() => {
        
    //     if (predictabilityActive) {
    //         predictabilityActive = false
    //     } else if (!predictabilityActive) {
    //         predictabilityActive = true
    //         // console.log("Entered to Interval: " + getNormallyDistributedRandomNumber(0, stddevPredRad))
    //         noiseXPredictability= getNormallyDistributedRandomNumber(0,stddevPredRad)
    //         noiseYPredictability = getNormallyDistributedRandomNumber(0,stddevPredRad)
    //         //  console.log("The noise in x is: "+  noiseXPredictability + " The noise in y is: " + noiseYPredictability)

    //         // playerPosCompX = getNormallyDistributedRandomNumber(player.position.x,stddevCompetence)

    //         // playerPosCompY = getNormallyDistributedRandomNumber(player.position.y,stddevCompetence)

    //         // distancePred = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
    //         // idealAngle = noiseXPredictability
    //         // idealAngle = Math.atan2((player.position.y + noiseYPredictability) - agent.position.y, (player.position.x + noiseXPredictability) - agent.position.x)
    //         // competenceVelocity =  Math.min(distancePred, agent.maxVelocity )
    //     }
    //     // console.log("CompetenceActive is: " + competenceActive)
    //     randomNumberIntervalPredic = Math.random()* 1000
    //     // console.log("The next interval will be: " + randomNumberInterval)
    // },randomNumberIntervalPredic)

    // TEST THE STOPPING FOR THE HUMAN
    // let NotYet = false
    // setInterval(() => {
    //     NotYet=true
    // }, 10);
    

    const player = new Player({
        position: {
          x: 200,
          y: 200,
        },
        maxVelocity: 10,
        // minVelocity: 5,
        // maxVelocity:15,
         velocity: {
           x: 0,
           y: 0,
         },
         color: "red",
         xpos: xpos,
         ypos: ypos,
         canvas: canvas,
         ctx: ctx
      });
      const agent = new Agent({
      position: {
          x: 500,
          y: 200,
        },
        maxVelocity: 10,
        acceleration: 0.1,
        rotationVel: 0.1,
        angle: 0,
        // minVelocity: 5,
        // maxVelocity:15,
         velocity: 0,
         angleWave: 0,
         color: "blue",
         canvas: canvas,
         ctx: ctx,
         distanceBetween: 1
      });

      const agentDemo = new Agent({
        position: {
            x: 500,
            y: 200,
          },
          maxVelocity: 100,
          acceleration: 0.1,
          rotationVel: 0.1,
          angle: 0,
          angleWave: 0,
           velocity: 0,
           color: "purple",
           canvas: canvas,
           ctx: ctx,
           distanceBetween: 1
        });
    
    

    

    function animate() {
        
        // Initialization
        window.requestAnimationFrame(animate);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // player.position.x = xpos + player.minVelocity
        // player.position.y = ypos + player.minVelocity
        //console.log(agent)
        player.update();
        if (!isNaN(xpos) ) {
            player.position.x = xpos    
        }

        if (!isNaN(ypos)) {
            player.position.y = ypos
        }

        

        // agentPrevX = agent.position.x
        // agentPrevY = agent.position.y

        
        
        if (activateWaves) {
            agent.updateWaves()
        }
        else {
            agent.update()
        }


        // if (activateWaves) {
        //     agentDemo.updateWaves()
        // }
        // else {
        //     agentDemo.update()
        // }
        
        agentDemo.update()
        
        // console.log("Player: " + player + " Agent: " + agent)
        // enemy.update();
        // console.log(playerPositions)
        // player.velocity = 0
         // player.velocity.x = 0;
         // player.velocity.y = 0;
         agentPositions["angle"].push(agent.angle)
         agentPositions["velocity"].push(agent.velocity)
          agent.velocity = 0
        //   agentDemo.velocity = 0
         // console.log(agent.velocity)
          agent.angle = 0
          
        

        // TRUST PROGRAMMING===============================================================================

        // Definitions
        anglePlayerSource = Math.atan2(player.position.y - 0, player.position.x - 0)
        // anglePlayerSource = Math.atan2(player.position.y - 0, player.position.x - 0)
        angleAgentSource = Math.atan2(agent.position.y - 0, agent.position.x - 0)

        // Add the values of the actual player positions in x and y coordinates.
        playerPositions["X"].push(player.position.x)
        playerPositions["Y"].push(player.position.y)
        playerPositions["angle"].push(anglePlayerSource)

        agentPositions["X"].push(agent.position.x)
        agentPositions["Y"].push(agent.position.y)
        
        

        // console.log(agentPositions["velocity"][10])
        // console.log("The position before was: " + playerPositions["X"][playerPositions["X"].length-2] + " the current position is: " + player.position.x)
        if (playerPositions["X"][playerPositions["X"].length-2] !== player.position.x) {
            
            counterTest = 0
            // console.log("Counter is back to: " + counterTest)
        } else {
            counterTest ++
            // console.log("The positions are the same")
            // console.log("The counter is: " +counterTest)
        }

        if (counterTest >= 10) {
            // console.log("STOP!!!!!!!!!!!!!!!")
        } else {
            // console.log("Currently moving")
        }
        rotationDifference = ((Math.atan2(player.position.y - prevY, player.position.x - prevX))* 180.0 / Math.PI)
        console.log("The angle is: " + ((Math.atan2(player.position.y - prevY, player.position.x - prevX))* 180.0 / Math.PI))
        // if (NotYet && !isNaN(playerPositions["X"].length -1)) {
        //     if (player.position.x === playerPositions["X"].length - 1) {
        //         timer ++
        //         console.log("Entered to this if")
        //     }
        //     console.log("The difference in movement for player is: " + player.position.x - playerPositions["X"].length-2)
        //     console.log("The timer is: " + timer)    
        // }
        
        
        // if (timer >= 1) {
        //     console.log("The player has stopped")
        //     timer =0
        // }

        // versionCompetence = 0

        // ADD THE VECTORS PLUS THE NOISE
        // versionCompetence === 1
        // if (perfect) {
        //     noiseXCompetence = 0
        //     noiseYCompetence = 0
        //     noiseXPredictability = 0
        //     noiseYPredictability = 0
        // } else if (qualityCompetence && versionCompetence === 1) {
        //     noiseXCompetence = 0
        //     noiseYCompetence = 0
        //     if (playerPositions["X"].length >= 30) {
        //         // console.log("Player Position: " + playerPositions["X"][playerPositions["X"].length-29])
        //         competenceDistance = Math.sqrt(((playerPositions["X"][playerPositions["X"].length-29] - agent.position.x) ** 2) + ((playerPositions["Y"][playerPositions["Y"].length-29] - agent.position.y) ** 2))

        //         if (distance !== 0) {
        //             competenceAngle = Math.atan2(playerPositions["Y"][playerPositions["Y"].length-29] - agent.position.y, playerPositions["X"][playerPositions["X"].length-29] - agent.position.x)
        //             agent.angle = competenceAngle
        //             competenceVelocity =  Math.min(competenceDistance, agent.maxVelocity )
        //             agent.velocity = competenceVelocity
        //         }    
        //     } else {
        //         distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

        //     if (distance !== 0) {
        //         idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
        //         agent.angle = idealAngle
        //         idealVelocity =  Math.min(distance, agent.maxVelocity )
        //         agent.velocity = idealVelocity
        //     }
        //     }
        // } else if (!qualityCompetence && versionCompetence === 1) {
        //     // console.log("Entered no quality version 1")
        //     noiseXCompetence = 0
        //     noiseYCompetence = 0
        //     if (playerPositions["X"].length >= 100) {
        //         // console.log("Player Position: " + playerPositions["X"][playerPositions["X"].length-99])
        //         competenceDistance = Math.sqrt(((playerPositions["X"][playerPositions["X"].length-99] - agent.position.x) ** 2) + ((playerPositions["Y"][playerPositions["Y"].length-99] - agent.position.y) ** 2))

        //         if (distance !== 0) {
        //             competenceAngle = Math.atan2(playerPositions["Y"][playerPositions["Y"].length-99] - agent.position.y, playerPositions["X"][playerPositions["X"].length-99] - agent.position.x)
        //             agent.angle = competenceAngle
        //             competenceVelocity =  Math.min(competenceDistance, agent.maxVelocity )
        //             agent.velocity = competenceVelocity
        //         }    
        //     } else {
        //         distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

        //     if (distance !== 0) {
        //         idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
        //         agent.angle = idealAngle
        //         idealVelocity =  Math.min(distance, agent.maxVelocity )
        //         agent.velocity = idealVelocity
        //     }
        //     }
        // }

        // BASE VECTOR DEFINITION
        
        // VERSION 1: Define the distance and use it to have an angle and velocity associated related to the position of the player.
        let distance2
        // if (versionCompetence === 1) {
        distance = calculateDistVelocityAngleWithNoise(player, agent, true).distance
        distance2 = calculateDistVelocityAngleWithNoise(player, agentDemo, true).distance
        // distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
        agent.distanceBetween = distance
        agentDemo.distanceBetween = distance2
        // console.log(`The distance between the agent: ${agent.distanceBetween} and the other: ${agentDemo.distanceBetween}`)
        if (distance2 !== 0) {
            idealAngle = calculateDistVelocityAngleWithNoise(player, agentDemo,true).angle
            agentDemo.angle = idealAngle
            // console.log(`The angle in radians is: ${idealAngle}. The angle in degrees is: ${idealAngle* (180 / Math.PI)}`)
            idealVelocity =  calculateDistVelocityAngleWithNoise(player, agentDemo, true).velocity
            agentDemo.velocity = idealVelocity
        }

        if (distance === 0) {
            agent.velocity= 0
        }

        if (distance2 === 0) {
            agentDemo.velocity = 0
        }


         if (distance !== 0 && !competenceActive && !perlinNoise && !predictabilityActive) {
            // console.log("Entered normal vector")
            idealAngle = calculateDistVelocityAngleWithNoise(player, agent,true).angle
            agent.angle = idealAngle
            // console.log(`The angle in radians is: ${idealAngle}. The angle in degrees is: ${idealAngle* (180 / Math.PI)}`)
            idealVelocity =  calculateDistVelocityAngleWithNoise(player, agent, true).velocity
            agent.velocity = idealVelocity
        }
        // }

        rotationDifferenceAWaves = Math.atan2(agent.position.y - agentWavesPrevY, agent.position.x - agentWavesPrevX) * 180.0 / Math.PI;
        rotationDifferenceAIdeal = Math.atan2(agentDemo.position.y - agentIdealPrevY, agent.position.x - agentIdealPrevX) * 180.0 / Math.PI;

        let dist = Math.sqrt(Math.pow(agent.position.y - agentIdealPrevY, 2) + Math.pow(agent.position.x - agentIdealPrevX, 2));
        agentWavesPrevX = agent.position.x;
        agentWavesPrevY = agent.position.y;

        agentIdealPrevX = agentDemo.position.X
        agentIdealPrevY = agentDemo.position.y

        if (!isNaN(prevY) && !isNaN(prevX)) {
            velocityPlayer = (player.position.y - prevY) / (player.position.x - prevX)
        }


        prevX = player.position.x
        prevY = player.position.y
        // while(rotation - rot > 180) {
        //     rotation -= 360;
        // }
        // while(rot - rotation > 180) {
        //     rotation += 360;
        // }
        var smooth = Math.min(1, dist/50);
        // rotationAgent = smooth * rot + (1 - smooth) * rotationAgent;
        socket.emit('locationAgent', room, agent.position.x, agent.position.y, rotationAgent, agentDemo.position.x, agentDemo.position.y, rotationDifferenceAWaves, rotationDifferenceAIdeal, agent.velocity, agentDemo.velocity);
        socket.emit('location', room, player.position.x, player.position.y, rotation, rotationDifference, velocityPlayer);
        //  console.log(`Position in X: ${agent.position.x} and Position in Y: ${agent.position.y}`)



        // COMPETENCE VECTOR DEFINITION

        // VERSION 1: CREATE A VARIATION OF THE SPEED AND ANGLE REQUIRED USING A NORMALLY DISTRIBUTED FUNCTION WHICH HAPPENS WITH A RANDOM NUMBER INTERVAL (GAUSSIAN NOISE)
        // DO NOT FORGET TURN SETINTERVAL ON

        // console.log(playerPositions["X"].length)
        // let competenceInterval = setInterval(() => {
        //     competencyAmount = getNormallyDistributedRandomNumber(distance,stddevCompetence)
        //     competenceValueList.push(competencyAmount)
        //     if (competencyAmount !== 0) {
        //         idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
        //         agent.angle = idealAngle
        //         competenceVelocity =  Math.min(competencyAmount, agent.maxVelocity )
        //         agent.velocity = competenceVelocity
        //     }

        //     // agent.velocity = competencyAmount
        // }, 1000)
        // console.log("The competency amount is:" + competencyAmount)
        // agent.velocity += competencyAmount

        

        // playerPosCompX = getNormallyDistributedRandomNumber(player.position.x,stddevCompetence)
        // // noiseX = getNormallyDistributedRandomNumber(0, stddevCompetence)
        // // noiseY = getNormallyDistributedRandomNumber(0,stddevCompetence)
        // // console.log("The noise in x is: " + noiseX + " and the noise in Y is: " + noiseY)
        // playerPosCompY = getNormallyDistributedRandomNumber(player.position.y,stddevCompetence)
        // // let agentPosCompX = getNormallyDistributedRandomNumber(agent.position.x,stddevCompetence)
        // // let agentPosCompY = getNormallyDistributedRandomNumber(agent.position.y, stddevCompetence)

        // playerPositionsCompetence["X"].push(playerPosCompX)
        // playerPositionsCompetence["Y"].push(playerPosCompY)

        // // agentPositionsCompetence["X"].push(agentPosCompX)
        // // agentPositionsCompetence["Y"].push(agentPosCompY)

        // let randomNumComp
        // randomNumComp = Math.random()
        // counter = 0
        // if (randomNumComp <= 1 && competenceActive) {
        //     // console.log("Entered to random competence function with random number: " + randomNumComp)
        //     competenceActive = true
        //     // distanceComp = Math.sqrt(((playerPosCompX - agent.position.x) ** 2) + ((playerPosCompY - agent.position.y) ** 2))
        //     if (distance !== 0) {
        //         // idealAngle = Math.atan2(playerPosCompY - agent.position.y, playerPosCompX - agent.position.x)
        //         agent.angle = idealAngle
        //         // competenceVelocity =  Math.min(distanceComp, agent.maxVelocity )
        //         agent.velocity = competenceVelocity
        //     }

        // } else {
        //     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

        //  if (distance !== 0) {
        //     // console.log("Entered normal vector")
        //     idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
        //     agent.angle = idealAngle
        //     idealVelocity =  Math.min(distance, agent.maxVelocity )
        //     agent.velocity = idealVelocity
        // }

        // }

        // VERSION 2: THE AGENT IS FOLLOWING 30 POSITIONS BEFORE THE ACTUAL POSITION OF THE PLAYER
        // console.log(!isNaN(playerPositions))
        // if (playerPositions["X"].length >= 30) {
        //     console.log("Player Position: " + playerPositions["X"][playerPositions["X"].length-29])
        //     competenceDistance = Math.sqrt(((playerPositions["X"][playerPositions["X"].length-29] - agent.position.x) ** 2) + ((playerPositions["Y"][playerPositions["Y"].length-29] - agent.position.y) ** 2))

        //     if (distance !== 0) {
        //         competenceAngle = Math.atan2(playerPositions["Y"][playerPositions["Y"].length-29] - agent.position.y, playerPositions["X"][playerPositions["X"].length-29] - agent.position.x)
        //         agent.angle = competenceAngle
        //         competenceVelocity =  Math.min(competenceDistance, agent.maxVelocity )
        //         agent.velocity = competenceVelocity
        //     }    
        // } else {
        //     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

        //   if (distance !== 0) {
        //      idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
        //      agent.angle = idealAngle
        //      idealVelocity =  Math.min(distance, agent.maxVelocity )
        //      agent.velocity = idealVelocity
        //  }
        // }
        // // MEASUREMENT OF COMPETENCE: AVERAGE OF DISTANCE OVER TIME
        // compMeasurementCounter ++
        // compMeasurement += distance / compMeasurementCounter
        // console.log(compMeasurement)

        // VERSION 3: PERLIN NOISE TEST  ====== NOT WORKING
        
        // let noise 
        // // let randPerlX
        // // let randPerlY
        // // randPerlX = Math.random() 
        // noise = perlin.get(Math.random(), Math.random())
        // console.log("The noise is: " + noise)
        // console.log("The position of the player with noise is:"+(player.position.x * noise) +" , "+(player.position.y * noise))
        
        // distance = Math.sqrt(((player.position.x * noise - agent.position.x) ** 2) + ((player.position.y * noise - agent.position.y) ** 2))

        //  if (distance !== 0 && !competenceActive) {
        //     // console.log("Entered normal vector")
        //     idealAngle = Math.atan2(player.position.y * noise - agent.position.y, player.position.x * noise - agent.position.x)
        //     agent.angle = idealAngle
        //     idealVelocity =  Math.min(distance, agent.maxVelocity )
        //     agent.velocity = idealVelocity
        // }
        

        // VERSION 4: LET AGENT DEAL WITH THE VALUES ======== NOT WORKING
        // let counterPlayerNow = playerPositions["X"].length-1
        // console.log(counterPlayerNow)
        // // console.log(counterPlayerBefore)
        // if (competenceActive && (counterPlayerNow- counterPlayerBefore)> 0) {
        //     agent.position.x = agentPositionsCompetence["X"][inter +(counterPlayerNow- counterPlayerBefore)]
        //     agent.position.y = agentPositionsCompetence["Y"][inter +(counterPlayerNow- counterPlayerBefore)]
        //     inter ++
        // }


        // PREDICTABILITY VECTOR

        // VERSION 1: USE THE MANIPULATIONS ONLY FOR THE ANGLE AND NOT THE DISTANCE

        // playerPosPredX = getNormallyDistributedRandomNumber(player.position.x,stddevCompetence)
        // // noiseX = getNormallyDistributedRandomNumber(0, stddevCompetence)
        // // noiseY = getNormallyDistributedRandomNumber(0,stddevCompetence)
        // // console.log("The noise in x is: " + noiseX + " and the noise in Y is: " + noiseY)
        // playerPosPredY = getNormallyDistributedRandomNumber(player.position.y,stddevCompetence)
        // // let agentPosCompX = getNormallyDistributedRandomNumber(agent.position.x,stddevCompetence)
        // // let agentPosCompY = getNormallyDistributedRandomNumber(agent.position.y, stddevCompetence)

        // playerPositionsPredictability["X"].push(playerPosPredX)
        // playerPositionsPredictability["Y"].push(playerPosPredY)

        // // agentPositionsCompetence["X"].push(agentPosCompX)
        // // agentPositionsCompetence["Y"].push(agentPosCompY)


        // randomNumPred = Math.random()
        // counter = 0
        // if (randomNumPred <= 0.8 && predictabilityActive) {
        //     // console.log("Entered to random competence function with random number: " + randomNumComp)
        //     predictabilityActive = true
        //     distancePred = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
        //     if (distance !== 0) {
        //         // idealAngle = Math.atan2(playerPosCompY - agent.position.y, playerPosCompX - agent.position.x)
        //         agent.angle = idealAngle
        //         competenceVelocity =  Math.min(distancePred, agent.maxVelocity )
        //         agent.velocity = competenceVelocity
        //     }

        // } else {
        //     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

        //  if (distance !== 0) {
        //     // console.log("Entered normal vector")
        //     idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
        //     agent.angle = idealAngle
        //     idealVelocity =  Math.min(distance, agent.maxVelocity )
        //     agent.velocity = idealVelocity
        // }

        // }

        // VERSION 2:

        // playerPosPredX = getNormallyDistributedRandomNumber(player.position.x,stddevCompetence)
        // // noiseX = getNormallyDistributedRandomNumber(0, stddevCompetence)
        // // noiseY = getNormallyDistributedRandomNumber(0,stddevCompetence)
        // // console.log("The noise in x is: " + noiseX + " and the noise in Y is: " + noiseY)
        // playerPosPredY = getNormallyDistributedRandomNumber(player.position.y,stddevCompetence)
        // // let agentPosCompX = getNormallyDistributedRandomNumber(agent.position.x,stddevCompetence)
        // // let agentPosCompY = getNormallyDistributedRandomNumber(agent.position.y, stddevCompetence)

        // playerPositionsPredictability["X"].push(playerPosPredX)
        // playerPositionsPredictability["Y"].push(playerPosPredY)

        // // agentPositionsCompetence["X"].push(agentPosCompX)
        // // agentPositionsCompetence["Y"].push(agentPosCompY)

        // randomNumPred = Math.random()
        // counter = 0
        // if (randomNumPred <= 1 && predictabilityActive) {
        //     // console.log("Entered to random competence function with random number: " + randomNumComp)
        //     predictabilityActive = true
        //     distancePred = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
        //     if (distance !== 0) {
        //         // idealAngle = Math.atan2(playerPosCompY - agent.position.y, playerPosCompX - agent.position.x)
        //         agent.angle = idealAngle
        //         // competenceVelocity =  Math.min(distancePred, agent.maxVelocity )
        //         competenceVelocity = getNormallyDistributedRandomNumber(agent.maxVelocity/2, 5 )
        //         agent.velocity = competenceVelocity
        //     }

        // } else {
        //     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

        //  if (distance !== 0) {
        //     // console.log("Entered normal vector")
        //     idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
        //     agent.angle = idealAngle
        //     idealVelocity =  Math.min(distance, agent.maxVelocity )
        //     agent.velocity = idealVelocity
        // }

        // }

        
    }

     animate() 
    
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






