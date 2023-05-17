
// ====================SYNCHROMOUSE CODE BEFORE=============================================

var init = function() {
    var socket = io();
    var room = '';
    var game = document.getElementById('game');
    var prevX = 0;
    var prevY = 0;
    var rotation = 0;
    var admin = false;
    var hiscore = 0;
    var startTimer = undefined;
    var scaleFactor = 1.0;

    socket.on('begin', function() {
        //Parsing the value of the room.
        var urlParams = new URLSearchParams(window.location.search);

        if(urlParams.has('room')) {
            room = urlParams.get('room');
            // Possibility of removing given new configuration.
            // Is the user entering an admin or a player.
            if(urlParams.has('admin')) {
                admin = true;
                socket.emit('join_admin', room);
                document.getElementById('cursor').style.display = 'none';
                var start_button = document.createElement('div');
                start_button.style.backgroundColor = 'red';
                start_button.innerHTML = 'START';
                start_button.onclick = function() {
                    console.log("START");
                    socket.emit('start', room);
                }
                document.getElementsByClassName('wrapper')[0].insertBefore(start_button, game);
                game.style.top = 30;
            }
            else {            
                socket.emit('join_room', room);
            }
        }
        // Tutorial page.
        if(urlParams.has('playground')) {
            document.getElementById('info').style.opacity = '0';

            function windowSizeChanged() {
                var width = document.getElementById('game').offsetWidth;
                var height = document.getElementById('game').offsetHeight;
                scaleFactor = Math.min(window.innerWidth / width, window.innerHeight / height);
                document.getElementById('game').style.transform = 'scale(' + scaleFactor + ')';
              }
              
              window.onresize = windowSizeChanged;
              windowSizeChanged();
        }
    });

    socket.on('location', function(socketId, x, y, rot) {
        // Identify the player based on the id that is placed on the socket.
        var player = document.getElementById(socketId);
        x *= game.offsetWidth;
        y *= game.offsetHeight;
        // Initization of the player.
        if(player === null) {
            player = document.createElement('div');
            player.classList.add('player');
            player.id = socketId;
            game.insertBefore(player, document.getElementById('cursor'));
        }
        player.style.left = game.offsetLeft + x - player.offsetWidth * 0.5;
        player.style.top = game.offsetTop + y - player.offsetHeight * 0.5;
        player.style.transform = 'rotate(' + rot + 'deg)';
    });

    socket.on('disconnected', function(socketId) {
        game.removeChild(document.getElementById(socketId));
    });
    // Change the background depending on the score of the players.
    socket.on('score', function(score) {
        score = Math.min(1, score);
        var blue = 255 * (1 - score);
        var green = 191 * (1 - 0.7 * score);// * (1 - score);
        var red = 255 * score;
        game.style.backgroundColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
    });
    // Initial style opacity.
    socket.on('start', function() {
        console.log('start');
        document.getElementById('info').style.opacity = '0';
    });
    // Process when the game ends.
    socket.on('end', function(score, finish) {
        document.getElementById('info').style.opacity = 1;
        // Setup the current score.
        if(score > hiscore) hiscore = score;
        document.getElementById('previous_score').innerHTML = '' + Math.round(score);
        document.getElementById('high_score').innerHTML = '' + Math.round(hiscore);
        // Setup of the end of the game.

        // Setup to change the time to "X".
        if(finish) {
            document.getElementById('time').innerHTML = 'X';
        }
        else {
            var seconds = 10;
            document.getElementById('time').innerHTML = seconds;
            if(startTimer !== undefined) clearInterval(startTimer);
            startTimer = setInterval(function() {
                seconds--;
                if(seconds < 0) {
                    clearInterval(startTimer);
                    startTimer = undefined;
                }
                else document.getElementById('time').innerHTML = seconds;
            }, 1000);
        }
    });
    // Movement of the cursor definition.
    game.onmousemove = function(evt) {
        if(!admin) {
            //var x = evt.pageX - game.offsetLeft;
            //var y = evt.pageY - game.offsetTop;
            var x = (evt.pageX - game.offsetLeft) / scaleFactor;
            var y = (evt.pageY - game.offsetTop) / scaleFactor;

            if(x > 0 && y > 0 && x < game.offsetWidth && y < game.offsetHeight && (x !== prevX || y !== prevY)) {
                var rot = Math.atan2(y - prevY, x - prevX) * 180.0 / Math.PI;
                var dist = Math.sqrt(Math.pow(y - prevY, 2) + Math.pow(x - prevX, 2));
                prevX = x;
                prevY = y;
                while(rotation - rot > 180) {
                    rotation -= 360;
                }
                while(rot - rotation > 180) {
                    rotation += 360;
                }
                var smooth = Math.min(1, dist/50);
                rotation = smooth * rot + (1 - smooth) * rotation;
                socket.emit('location', room, x / (game.offsetWidth), y / (game.offsetHeight), rotation);
                var cursor = document.getElementById('cursor');
                cursor.style.left = x - 16;
                cursor.style.top = y - 16;
                cursor.style.transform = 'rotate(' + rotation +'deg)';
            }
        }
    }
}


// ======================== COMMENTS AND METHODS FROM CURRENT SCRIPT.JS VERSION


// function initializeGame() {
    
// }

// function calculateDistVelocityAngle(player, agent) {
//     let distance
//     let angle
//     let velocity

//     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
//     angle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
//     velocity =  Math.min(distance, agent.maxVelocity )

//     return {distance, angle, velocity}
// }

// function calculateNoise(meanParamComp, stdDevParamComp, meanParamCompRad, stdDevParamCompRad, meanParamPred, stdDevParamPred) {
//     let noiseFactorCompetenceVelocity = getNormallyDistributedRandomNumber(meanParamComp,stdDevParamComp)
//     let noiseFactorCompetenceAngle = getNormallyDistributedRandomNumber(meanParamCompRad, stdDevParamCompRad)
//     let noiseFactorPredictability = getNormallyDistributedRandomNumber(meanParamPred,stdDevParamPred)

//     return { noiseFactorCompetenceVelocity, noiseFactorCompetenceAngle, noiseFactorPredictability}
// }

// function calculateDistVelocityAngleWithNoise(player, agent, withNoise) {
//     let distance
//     let angle
//     let velocity

//     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
//     angle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
//     velocity =  Math.min(distance, agent.maxVelocity )

//     if (withNoise) {
//         // angle -= Math.PI/4
//         // angle = Math.atan2(player.position.y - 0, player.position.x - 0) + Math.PI/4
//         // console.log(angle)
//         // velocity -=5

//     }
   
//     return {distance, angle, velocity}
// }

// function toggleScreen(id, toggle) {
//     let element = document.getElementById(id)
//     let display = (toggle) ? 'block': 'none'
//     element.style.display = display
// }

// function startMenu() {
//     toggleScreen('start-screen', false)
//     toggleScreen('mode-screen', true)

//     // demoGame()
// }

// function startDemo() {
//     toggleScreen('mode-screen', false)
//     toggleScreen('demo', true)

//     socket.on('begin', function() {
//         urlParams = new URLSearchParams(window.location.search);
        


//         if(urlParams.has('room')) {
//             room = urlParams.get('room');
//             // Possibility of removing given new configuration.
//             // Is the user entering an admin or a player.
//              socket.emit('join_room', room)

//         }
//         // Tutorial page.
//         if(urlParams.has('playground')) {
//             // document.getElementById('info').style.opacity = '0';

//             // function windowSizeChanged() {
//             //     var width = document.getElementById('game').offsetWidth;
//             //     var height = document.getElementById('game').offsetHeight;
//             //     scaleFactor = Math.min(window.innerWidth / width, window.innerHeight / height);
//             //     document.getElementById('game').style.transform = 'scale(' + scaleFactor + ')';
//             //   }
              
//             //   window.onresize = windowSizeChanged;
//             //   windowSizeChanged();
//         }
//     })

// }

// function goBackMenu() {

//     toggleScreen('mode-screen', true)
//     toggleScreen('demo', false)
// }

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

    // let competenceParameter = 700
    // let predictabilityParameter = 700
    // setInterval(() => {
    //     setInterval(() => {
    //         agentDemo.angle = idealAngle + Math.PI/4
    //         agentDemo.velocity = idealVelocity
    //     }, competenceParameter); 
    // }, 1000);


     // setInterval(() => {
    //     testLogic = true
    //     // agentDemo.velocity = total / agentPositions['velocity'].length;
    //     // agentDemo.angle = average(agentPositions['angle'])* Math.random()
    //     // console.log(`The ideal angle is: ${idealAngle}`)
        
    //     // console.log(agentPositions['velocity'])
    //     // console.log(average(agentPositions['velocity']))
    //     // agentDemo.velocity = idealVelocity
    //     // agentDemo.velocity = average(agentPositions['velocity']) * Math.random()
    //     // agentDemo.velocity = getNormallyDistributedRandomNumber(idealVelocity, 5)
    // }, competenceParameter);

    // setInterval(() => {
    //     // agentDemo.angle = getNormallyDistributedRandomNumber(idealAngle, Math.PI/2)
    //     // agentDemo.angle = idealAngle
    //     // console.log(`The difference between the angles is: ${idealAngle-getNormallyDistributedRandomNumber(idealAngle, Math.PI/2)}`)
    // }, predictabilityParameter);


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
    

    // const player = new Player({
    //     position: {
    //       x: 200,
    //       y: 200,
    //     },
    //     maxVelocity: 10,
    //     // minVelocity: 5,
    //     // maxVelocity:15,
    //      velocity: {
    //        x: 0,
    //        y: 0,
    //      },
    //      color: "red",
    //      xpos: xpos,
    //      ypos: ypos,
    //      canvas: canvas,
    //      ctx: ctx
    //   });
    //   const agent = new Agent({
    //   position: {
    //       x: 500,
    //       y: 200,
    //     },
    //     maxVelocity: 10,
    //     acceleration: 0.1,
    //     rotationVel: 0.1,
    //     angle: 0,
    //     // minVelocity: 5,
    //     // maxVelocity:15,
    //      velocity: 0,
    //      angleWave: 0,
    //      color: "blue",
    //      canvas: canvas,
    //      ctx: ctx,
    //      distanceBetween: 1
    //   });

    //   const agentDemo = new Agent({
    //     position: {
    //         x: 500,
    //         y: 200,
    //       },
    //       maxVelocity: 100,
    //       acceleration: 0.1,
    //       rotationVel: 0.1,
    //       angle: 0,
    //       angleWave: 0,
    //        velocity: 0,
    //        color: "purple",
    //        canvas: canvas,
    //        ctx: ctx,
    //        distanceBetween: 1
    //     });
    
    

    

    // function animate() {
        
    //     // Initialization
    //     window.requestAnimationFrame(animate);
    //     ctx.fillStyle = "white";
    //     ctx.fillRect(0, 0, canvas.width, canvas.height);
    //     // player.position.x = xpos + player.minVelocity
    //     // player.position.y = ypos + player.minVelocity
    //     //console.log(agent)
    //     player.update();
    //     if (!isNaN(xpos) ) {
    //         player.position.x = xpos    
    //     }

    //     if (!isNaN(ypos)) {
    //         player.position.y = ypos
    //     }

        

    //     // agentPrevX = agent.position.x
    //     // agentPrevY = agent.position.y

        
        
    //     if (activateWaves) {
    //         agent.updateWaves()
    //     }
    //     else {
    //         agent.update()
    //     }


    //     // if (activateWaves) {
    //     //     agentDemo.updateWaves()
    //     // }
    //     // else {
    //     //     agentDemo.update()
    //     // }
        
    //     agentDemo.update()
        
    //     // console.log("Player: " + player + " Agent: " + agent)
    //     // enemy.update();
    //     // console.log(playerPositions)
    //     // player.velocity = 0
    //      // player.velocity.x = 0;
    //      // player.velocity.y = 0;
    //      agentPositions["angle"].push(agent.angle)
    //      agentPositions["velocity"].push(agent.velocity)
    //       agent.velocity = 0
    //     //   agentDemo.velocity = 0
    //      // console.log(agent.velocity)
    //       agent.angle = 0
          
        

    //     // TRUST PROGRAMMING===============================================================================

    //     // Definitions
    //     anglePlayerSource = Math.atan2(player.position.y - 0, player.position.x - 0)
    //     // anglePlayerSource = Math.atan2(player.position.y - 0, player.position.x - 0)
    //     angleAgentSource = Math.atan2(agent.position.y - 0, agent.position.x - 0)

    //     // Add the values of the actual player positions in x and y coordinates.
    //     playerPositions["X"].push(player.position.x)
    //     playerPositions["Y"].push(player.position.y)
    //     playerPositions["angle"].push(anglePlayerSource)

    //     agentPositions["X"].push(agent.position.x)
    //     agentPositions["Y"].push(agent.position.y)
        
        

    //     // console.log(agentPositions["velocity"][10])
    //     // console.log("The position before was: " + playerPositions["X"][playerPositions["X"].length-2] + " the current position is: " + player.position.x)
    //     if (playerPositions["X"][playerPositions["X"].length-2] !== player.position.x) {
            
    //         counterTest = 0
    //         // console.log("Counter is back to: " + counterTest)
    //     } else {
    //         counterTest ++
    //         // console.log("The positions are the same")
    //         // console.log("The counter is: " +counterTest)
    //     }

    //     if (counterTest >= 10) {
    //         // console.log("STOP!!!!!!!!!!!!!!!")
    //     } else {
    //         // console.log("Currently moving")
    //     }
    //     rotationDifference = ((Math.atan2(player.position.y - prevY, player.position.x - prevX))* 180.0 / Math.PI)
    //     console.log("The angle is: " + ((Math.atan2(player.position.y - prevY, player.position.x - prevX))* 180.0 / Math.PI))
    //     // if (NotYet && !isNaN(playerPositions["X"].length -1)) {
    //     //     if (player.position.x === playerPositions["X"].length - 1) {
    //     //         timer ++
    //     //         console.log("Entered to this if")
    //     //     }
    //     //     console.log("The difference in movement for player is: " + player.position.x - playerPositions["X"].length-2)
    //     //     console.log("The timer is: " + timer)    
    //     // }
        
        
    //     // if (timer >= 1) {
    //     //     console.log("The player has stopped")
    //     //     timer =0
    //     // }

    //     // versionCompetence = 0

    //     // ADD THE VECTORS PLUS THE NOISE
    //     // versionCompetence === 1
    //     // if (perfect) {
    //     //     noiseXCompetence = 0
    //     //     noiseYCompetence = 0
    //     //     noiseXPredictability = 0
    //     //     noiseYPredictability = 0
    //     // } else if (qualityCompetence && versionCompetence === 1) {
    //     //     noiseXCompetence = 0
    //     //     noiseYCompetence = 0
    //     //     if (playerPositions["X"].length >= 30) {
    //     //         // console.log("Player Position: " + playerPositions["X"][playerPositions["X"].length-29])
    //     //         competenceDistance = Math.sqrt(((playerPositions["X"][playerPositions["X"].length-29] - agent.position.x) ** 2) + ((playerPositions["Y"][playerPositions["Y"].length-29] - agent.position.y) ** 2))

    //     //         if (distance !== 0) {
    //     //             competenceAngle = Math.atan2(playerPositions["Y"][playerPositions["Y"].length-29] - agent.position.y, playerPositions["X"][playerPositions["X"].length-29] - agent.position.x)
    //     //             agent.angle = competenceAngle
    //     //             competenceVelocity =  Math.min(competenceDistance, agent.maxVelocity )
    //     //             agent.velocity = competenceVelocity
    //     //         }    
    //     //     } else {
    //     //         distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

    //     //     if (distance !== 0) {
    //     //         idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    //     //         agent.angle = idealAngle
    //     //         idealVelocity =  Math.min(distance, agent.maxVelocity )
    //     //         agent.velocity = idealVelocity
    //     //     }
    //     //     }
    //     // } else if (!qualityCompetence && versionCompetence === 1) {
    //     //     // console.log("Entered no quality version 1")
    //     //     noiseXCompetence = 0
    //     //     noiseYCompetence = 0
    //     //     if (playerPositions["X"].length >= 100) {
    //     //         // console.log("Player Position: " + playerPositions["X"][playerPositions["X"].length-99])
    //     //         competenceDistance = Math.sqrt(((playerPositions["X"][playerPositions["X"].length-99] - agent.position.x) ** 2) + ((playerPositions["Y"][playerPositions["Y"].length-99] - agent.position.y) ** 2))

    //     //         if (distance !== 0) {
    //     //             competenceAngle = Math.atan2(playerPositions["Y"][playerPositions["Y"].length-99] - agent.position.y, playerPositions["X"][playerPositions["X"].length-99] - agent.position.x)
    //     //             agent.angle = competenceAngle
    //     //             competenceVelocity =  Math.min(competenceDistance, agent.maxVelocity )
    //     //             agent.velocity = competenceVelocity
    //     //         }    
    //     //     } else {
    //     //         distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

    //     //     if (distance !== 0) {
    //     //         idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    //     //         agent.angle = idealAngle
    //     //         idealVelocity =  Math.min(distance, agent.maxVelocity )
    //     //         agent.velocity = idealVelocity
    //     //     }
    //     //     }
    //     // }

    //     // BASE VECTOR DEFINITION
        
    //     // VERSION 1: Define the distance and use it to have an angle and velocity associated related to the position of the player.
    //     let distance2
    //     // if (versionCompetence === 1) {
    //     distance = calculateDistVelocityAngleWithNoise(player, agent, true).distance
    //     distance2 = calculateDistVelocityAngleWithNoise(player, agentDemo, true).distance
    //     // distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
    //     agent.distanceBetween = distance
    //     agentDemo.distanceBetween = distance2
    //     // console.log(`The distance between the agent: ${agent.distanceBetween} and the other: ${agentDemo.distanceBetween}`)
    //     if (distance2 !== 0) {
    //         idealAngle = calculateDistVelocityAngleWithNoise(player, agentDemo,true).angle
    //         agentDemo.angle = idealAngle
    //         // console.log(`The angle in radians is: ${idealAngle}. The angle in degrees is: ${idealAngle* (180 / Math.PI)}`)
    //         idealVelocity =  calculateDistVelocityAngleWithNoise(player, agentDemo, true).velocity
    //         agentDemo.velocity = idealVelocity
    //     }

    //     if (distance === 0) {
    //         agent.velocity= 0
    //     }

    //     if (distance2 === 0) {
    //         agentDemo.velocity = 0
    //     }


    //      if (distance !== 0 && !competenceActive && !perlinNoise && !predictabilityActive) {
    //         // console.log("Entered normal vector")
    //         idealAngle = calculateDistVelocityAngleWithNoise(player, agent,true).angle
    //         agent.angle = idealAngle
    //         // console.log(`The angle in radians is: ${idealAngle}. The angle in degrees is: ${idealAngle* (180 / Math.PI)}`)
    //         idealVelocity =  calculateDistVelocityAngleWithNoise(player, agent, true).velocity
    //         agent.velocity = idealVelocity
    //     }
    //     // }

    //     rotationDifferenceAWaves = Math.atan2(agent.position.y - agentWavesPrevY, agent.position.x - agentWavesPrevX) * 180.0 / Math.PI;
    //     rotationDifferenceAIdeal = Math.atan2(agentDemo.position.y - agentIdealPrevY, agent.position.x - agentIdealPrevX) * 180.0 / Math.PI;

    //     let dist = Math.sqrt(Math.pow(agent.position.y - agentIdealPrevY, 2) + Math.pow(agent.position.x - agentIdealPrevX, 2));
    //     agentWavesPrevX = agent.position.x;
    //     agentWavesPrevY = agent.position.y;

    //     agentIdealPrevX = agentDemo.position.X
    //     agentIdealPrevY = agentDemo.position.y

    //     if (!isNaN(prevY) && !isNaN(prevX)) {
    //         velocityPlayer = (player.position.y - prevY) / (player.position.x - prevX)
    //     }


    //     prevX = player.position.x
    //     prevY = player.position.y
    //     // while(rotation - rot > 180) {
    //     //     rotation -= 360;
    //     // }
    //     // while(rot - rotation > 180) {
    //     //     rotation += 360;
    //     // }
    //     var smooth = Math.min(1, dist/50);
    //     // rotationAgent = smooth * rot + (1 - smooth) * rotationAgent;
    //     socket.emit('locationAgent', room, agent.position.x, agent.position.y, rotationAgent, agentDemo.position.x, agentDemo.position.y, rotationDifferenceAWaves, rotationDifferenceAIdeal, agent.velocity, agentDemo.velocity);
    //     socket.emit('location', room, player.position.x, player.position.y, rotation, rotationDifference, velocityPlayer);
    //     //  console.log(`Position in X: ${agent.position.x} and Position in Y: ${agent.position.y}`)



    //     // COMPETENCE VECTOR DEFINITION

    //     // VERSION 1: CREATE A VARIATION OF THE SPEED AND ANGLE REQUIRED USING A NORMALLY DISTRIBUTED FUNCTION WHICH HAPPENS WITH A RANDOM NUMBER INTERVAL (GAUSSIAN NOISE)
    //     // DO NOT FORGET TURN SETINTERVAL ON

    //     // console.log(playerPositions["X"].length)
    //     // let competenceInterval = setInterval(() => {
    //     //     competencyAmount = getNormallyDistributedRandomNumber(distance,stddevCompetence)
    //     //     competenceValueList.push(competencyAmount)
    //     //     if (competencyAmount !== 0) {
    //     //         idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    //     //         agent.angle = idealAngle
    //     //         competenceVelocity =  Math.min(competencyAmount, agent.maxVelocity )
    //     //         agent.velocity = competenceVelocity
    //     //     }

    //     //     // agent.velocity = competencyAmount
    //     // }, 1000)
    //     // console.log("The competency amount is:" + competencyAmount)
    //     // agent.velocity += competencyAmount

        

    //     // playerPosCompX = getNormallyDistributedRandomNumber(player.position.x,stddevCompetence)
    //     // // noiseX = getNormallyDistributedRandomNumber(0, stddevCompetence)
    //     // // noiseY = getNormallyDistributedRandomNumber(0,stddevCompetence)
    //     // // console.log("The noise in x is: " + noiseX + " and the noise in Y is: " + noiseY)
    //     // playerPosCompY = getNormallyDistributedRandomNumber(player.position.y,stddevCompetence)
    //     // // let agentPosCompX = getNormallyDistributedRandomNumber(agent.position.x,stddevCompetence)
    //     // // let agentPosCompY = getNormallyDistributedRandomNumber(agent.position.y, stddevCompetence)

    //     // playerPositionsCompetence["X"].push(playerPosCompX)
    //     // playerPositionsCompetence["Y"].push(playerPosCompY)

    //     // // agentPositionsCompetence["X"].push(agentPosCompX)
    //     // // agentPositionsCompetence["Y"].push(agentPosCompY)

    //     // let randomNumComp
    //     // randomNumComp = Math.random()
    //     // counter = 0
    //     // if (randomNumComp <= 1 && competenceActive) {
    //     //     // console.log("Entered to random competence function with random number: " + randomNumComp)
    //     //     competenceActive = true
    //     //     // distanceComp = Math.sqrt(((playerPosCompX - agent.position.x) ** 2) + ((playerPosCompY - agent.position.y) ** 2))
    //     //     if (distance !== 0) {
    //     //         // idealAngle = Math.atan2(playerPosCompY - agent.position.y, playerPosCompX - agent.position.x)
    //     //         agent.angle = idealAngle
    //     //         // competenceVelocity =  Math.min(distanceComp, agent.maxVelocity )
    //     //         agent.velocity = competenceVelocity
    //     //     }

    //     // } else {
    //     //     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

    //     //  if (distance !== 0) {
    //     //     // console.log("Entered normal vector")
    //     //     idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    //     //     agent.angle = idealAngle
    //     //     idealVelocity =  Math.min(distance, agent.maxVelocity )
    //     //     agent.velocity = idealVelocity
    //     // }

    //     // }

    //     // VERSION 2: THE AGENT IS FOLLOWING 30 POSITIONS BEFORE THE ACTUAL POSITION OF THE PLAYER
    //     // console.log(!isNaN(playerPositions))
    //     // if (playerPositions["X"].length >= 30) {
    //     //     console.log("Player Position: " + playerPositions["X"][playerPositions["X"].length-29])
    //     //     competenceDistance = Math.sqrt(((playerPositions["X"][playerPositions["X"].length-29] - agent.position.x) ** 2) + ((playerPositions["Y"][playerPositions["Y"].length-29] - agent.position.y) ** 2))

    //     //     if (distance !== 0) {
    //     //         competenceAngle = Math.atan2(playerPositions["Y"][playerPositions["Y"].length-29] - agent.position.y, playerPositions["X"][playerPositions["X"].length-29] - agent.position.x)
    //     //         agent.angle = competenceAngle
    //     //         competenceVelocity =  Math.min(competenceDistance, agent.maxVelocity )
    //     //         agent.velocity = competenceVelocity
    //     //     }    
    //     // } else {
    //     //     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

    //     //   if (distance !== 0) {
    //     //      idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    //     //      agent.angle = idealAngle
    //     //      idealVelocity =  Math.min(distance, agent.maxVelocity )
    //     //      agent.velocity = idealVelocity
    //     //  }
    //     // }
    //     // // MEASUREMENT OF COMPETENCE: AVERAGE OF DISTANCE OVER TIME
    //     // compMeasurementCounter ++
    //     // compMeasurement += distance / compMeasurementCounter
    //     // console.log(compMeasurement)

    //     // VERSION 3: PERLIN NOISE TEST  ====== NOT WORKING
        
    //     // let noise 
    //     // // let randPerlX
    //     // // let randPerlY
    //     // // randPerlX = Math.random() 
    //     // noise = perlin.get(Math.random(), Math.random())
    //     // console.log("The noise is: " + noise)
    //     // console.log("The position of the player with noise is:"+(player.position.x * noise) +" , "+(player.position.y * noise))
        
    //     // distance = Math.sqrt(((player.position.x * noise - agent.position.x) ** 2) + ((player.position.y * noise - agent.position.y) ** 2))

    //     //  if (distance !== 0 && !competenceActive) {
    //     //     // console.log("Entered normal vector")
    //     //     idealAngle = Math.atan2(player.position.y * noise - agent.position.y, player.position.x * noise - agent.position.x)
    //     //     agent.angle = idealAngle
    //     //     idealVelocity =  Math.min(distance, agent.maxVelocity )
    //     //     agent.velocity = idealVelocity
    //     // }
        

    //     // VERSION 4: LET AGENT DEAL WITH THE VALUES ======== NOT WORKING
    //     // let counterPlayerNow = playerPositions["X"].length-1
    //     // console.log(counterPlayerNow)
    //     // // console.log(counterPlayerBefore)
    //     // if (competenceActive && (counterPlayerNow- counterPlayerBefore)> 0) {
    //     //     agent.position.x = agentPositionsCompetence["X"][inter +(counterPlayerNow- counterPlayerBefore)]
    //     //     agent.position.y = agentPositionsCompetence["Y"][inter +(counterPlayerNow- counterPlayerBefore)]
    //     //     inter ++
    //     // }


    //     // PREDICTABILITY VECTOR

    //     // VERSION 1: USE THE MANIPULATIONS ONLY FOR THE ANGLE AND NOT THE DISTANCE

    //     // playerPosPredX = getNormallyDistributedRandomNumber(player.position.x,stddevCompetence)
    //     // // noiseX = getNormallyDistributedRandomNumber(0, stddevCompetence)
    //     // // noiseY = getNormallyDistributedRandomNumber(0,stddevCompetence)
    //     // // console.log("The noise in x is: " + noiseX + " and the noise in Y is: " + noiseY)
    //     // playerPosPredY = getNormallyDistributedRandomNumber(player.position.y,stddevCompetence)
    //     // // let agentPosCompX = getNormallyDistributedRandomNumber(agent.position.x,stddevCompetence)
    //     // // let agentPosCompY = getNormallyDistributedRandomNumber(agent.position.y, stddevCompetence)

    //     // playerPositionsPredictability["X"].push(playerPosPredX)
    //     // playerPositionsPredictability["Y"].push(playerPosPredY)

    //     // // agentPositionsCompetence["X"].push(agentPosCompX)
    //     // // agentPositionsCompetence["Y"].push(agentPosCompY)


    //     // randomNumPred = Math.random()
    //     // counter = 0
    //     // if (randomNumPred <= 0.8 && predictabilityActive) {
    //     //     // console.log("Entered to random competence function with random number: " + randomNumComp)
    //     //     predictabilityActive = true
    //     //     distancePred = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
    //     //     if (distance !== 0) {
    //     //         // idealAngle = Math.atan2(playerPosCompY - agent.position.y, playerPosCompX - agent.position.x)
    //     //         agent.angle = idealAngle
    //     //         competenceVelocity =  Math.min(distancePred, agent.maxVelocity )
    //     //         agent.velocity = competenceVelocity
    //     //     }

    //     // } else {
    //     //     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

    //     //  if (distance !== 0) {
    //     //     // console.log("Entered normal vector")
    //     //     idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    //     //     agent.angle = idealAngle
    //     //     idealVelocity =  Math.min(distance, agent.maxVelocity )
    //     //     agent.velocity = idealVelocity
    //     // }

    //     // }

    //     // VERSION 2:

    //     // playerPosPredX = getNormallyDistributedRandomNumber(player.position.x,stddevCompetence)
    //     // // noiseX = getNormallyDistributedRandomNumber(0, stddevCompetence)
    //     // // noiseY = getNormallyDistributedRandomNumber(0,stddevCompetence)
    //     // // console.log("The noise in x is: " + noiseX + " and the noise in Y is: " + noiseY)
    //     // playerPosPredY = getNormallyDistributedRandomNumber(player.position.y,stddevCompetence)
    //     // // let agentPosCompX = getNormallyDistributedRandomNumber(agent.position.x,stddevCompetence)
    //     // // let agentPosCompY = getNormallyDistributedRandomNumber(agent.position.y, stddevCompetence)

    //     // playerPositionsPredictability["X"].push(playerPosPredX)
    //     // playerPositionsPredictability["Y"].push(playerPosPredY)

    //     // // agentPositionsCompetence["X"].push(agentPosCompX)
    //     // // agentPositionsCompetence["Y"].push(agentPosCompY)

    //     // randomNumPred = Math.random()
    //     // counter = 0
    //     // if (randomNumPred <= 1 && predictabilityActive) {
    //     //     // console.log("Entered to random competence function with random number: " + randomNumComp)
    //     //     predictabilityActive = true
    //     //     distancePred = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))
    //     //     if (distance !== 0) {
    //     //         // idealAngle = Math.atan2(playerPosCompY - agent.position.y, playerPosCompX - agent.position.x)
    //     //         agent.angle = idealAngle
    //     //         // competenceVelocity =  Math.min(distancePred, agent.maxVelocity )
    //     //         competenceVelocity = getNormallyDistributedRandomNumber(agent.maxVelocity/2, 5 )
    //     //         agent.velocity = competenceVelocity
    //     //     }

    //     // } else {
    //     //     distance = Math.sqrt(((player.position.x - agent.position.x) ** 2) + ((player.position.y - agent.position.y) ** 2))

    //     //  if (distance !== 0) {
    //     //     // console.log("Entered normal vector")
    //     //     idealAngle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x)
    //     //     agent.angle = idealAngle
    //     //     idealVelocity =  Math.min(distance, agent.maxVelocity )
    //     //     agent.velocity = idealVelocity
    //     // }

    //     // }

        
    // }

    //  animate() 


// ================================ NO RELATED TO CURRENT VERSION OF THE GAME

















// // ================================PREVIOUS VERSION GAME =============================================

// function HATGame() {
//     const canvas = document.getElementById("canvas-HAT");
//     // console.log(document.getElementById("canvas-HAT"))
//     const ctx = canvas.getContext("2d");

//     canvas.width = 1024;
//     canvas.height = 576;

//     let xpos
//     let ypos

//     class Agent {
//         constructor({ position, velocity, angle, maxVelocity, rotationVel, acceleration, color = "blue" }) {
//             this.position = position;
//             this.velocity = velocity
//             this.angle = angle
//             this.maxVelocity =  maxVelocity
//             this.rotationVel = rotationVel
//             this.acceleration = acceleration
//             this.size = 15;
//             this.color = color;
//         }
          
//         draw() {
//             ctx.fillStyle = this.color;
//             ctx.beginPath()
//             ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
//             ctx.fill()
//         }
          
//         update() {
//             this.draw();

//             this.position.x += this.velocity.x * Math.sin(this.angle);
//             this.position.y += this.velocity.x * Math.cos(this.angle)

//             console.log('The position of the agent is: ' + this.position.x + " The velocity of the agent is: " + this.velocity.x)


//             // Detect Side Walls
//             if (this.position.x + this.size > canvas.width) {
//                 this.position.x = canvas.width - this.size
//             }
    
//             if (this.position.x - this.size < 0) {
//                 this.position.x = this.size
//             }

    
//             // Detect top and bottom walls
//             if (this.position.y + this.size > canvas.height) {
//                 this.position.y = canvas.height -this.size
//             }
    
//             if (this.position.y - this.size < 0) {
//                 this.position.y = this.size
//             }
//         }
//       }

//     class Player {
//         constructor({ position, velocity, angle, maxVelocity, rotationVel, acceleration, color = "red" }) {
//           this.position = position;
//           this.velocity = velocity
//           this.angle = angle
//           this.maxVelocity =  maxVelocity
//           this.rotationVel = rotationVel
//           this.acceleration = acceleration
//         //   this.minVelocity = minVelocity;
//         //   this.maxVelocity = maxVelocity;
//         //   this.height = 150;
//         //   this.width = 50;
//           this.size = 15;
//         //   this.attackBox = {
//         //     position: {
//         //       x: this.position.x,
//         //       y: this.position.y,
//         //     },
//         //       offset,
//         //       width: 100,
//         //       height: 50,
//         //     };
//             this.color = color;
//         }
          
//         draw() {
//             ctx.fillStyle = this.color;
//             // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
//             // ctx.translate(this.position.x, this.position.y)
//             ctx.beginPath()
//             ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
//             ctx.fill()
//             // ctx.restore()
//         }
          
//         update() {
//             // ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
//             this.draw();
            
//             // this.position.x += this.minVelocity;
//             // this.position.y += this.minVelocity;
            
//             // console.log(this.position.x + ', ' + this.position.y)

//             this.position.x += this.velocity.x * Math.sin(this.angle);
//             this.position.y += this.velocity.x * Math.cos(this.angle)

//             console.log('The position is: ' + this.position.x + " The velocity is: " + this.velocity.x)

//             // ctx.translate(this.position.x, this.position.y)
//             // this.position.y += this.velocity;

//             // Detect Side Walls
//             if (this.position.x + this.size > canvas.width) {
//                 this.position.x = canvas.width - this.size
//             }
    
//             if (this.position.x - this.size < 0) {
//                 this.position.x = this.size
//             }

    
//             // Detect top and bottom walls
//             if (this.position.y + this.size > canvas.height) {
//                 this.position.y = canvas.height -this.size
//             }
    
//             if (this.position.y - this.size < 0) {
//                 this.position.y = this.size
//             }

            
          
//             // this.position.x += this.minVelocity;
//             // this.position.y += this.minVelocity;
          
//             // if (this.position.y + this.height + this.velocity.y >= canvas.height -96) {
//             //  this.velocity.y = 0;
//             //  } else {
//             //  this.velocity.y += gravity;
//             //  }
//         }
//       }

//     const player = new Player({
//         position: {
//           x: 200,
//           y: 200,
//         },
//         maxVelocity: 5,
//         acceleration: 0.1,
//         rotationVel: 0.1,
//         // velocity: 0,
//         angle: 0,
//         // minVelocity: 5,
//         // maxVelocity:15,
//          velocity: {
//            x: 0,
//            y: 0,
//          },
//       });
//       const agent = new Agent({
//         position: {
//           x: 500,
//           y: 200,
//         },
//         maxVelocity: 5,
//         acceleration: 0.1,
//         rotationVel: 0.1,
//         // velocity: 0,
//         angle: 0,
//         // minVelocity: 5,
//         // maxVelocity:15,
//          velocity: {
//            x: 0,
//            y: 0,
//          },
//       });
    
//     console.log(player)
//     // MOUSE MOVEMENTS
//     // canvas.addEventListener('mousemove', function (event) {
//     //     let mouseX = event.pageX - canvas.offsetLeft
//     //     let mouseY = event.pageY - canvas.offsetTop
//     //     document.getElementById("objectCoords-HAT").innerHTML = mouseX  + ", " + mouseY;
//     //     xpos = mouseX
//     //     ypos = mouseY
//     //     return {
//     //         x: mouseX,
//     //         y: mouseY
//     //     }
//     // })
    
// // EVENT LISTENERS FOR KEYS
// window.addEventListener("keydown", (event) => {
//     switch (event.key) {
//         case "d":
//             keys.d.pressed = true;
//             player.lastKey = "d";
//             break;
//         case "a":
//             keys.a.pressed = true;
//             player.lastKey = "a"
//             break;
//         case "s":
//             keys.s.pressed = true;
//             player.lastKey = "s"
//             break;
//         case "w":
//             keys.w.pressed = true;
//             player.lastKey = "w"
//             break;
//     }
// });

// window.addEventListener("keyup", (event) => {
//     // Player Key Press
//     switch (event.key) {
//         case "d":
//             keys.d.pressed = false;
//             break;
//         case "a":
//             keys.a.pressed = false;
//             break;
//         case "s":
//             keys.s.pressed = false;
//             break;
//         case "w":
//             keys.w.pressed = false;
//             break;
//         default:
//             break;
//     }
// })
//     const keys = {
//         d: {
//             pressed: false,
//         },
//         a: {
//             pressed: false,
//         },
//         w: {
//             pressed: false,
//         },
//         s: {
//             pressed: false,
//         },
//   };

//     // document.getElementById("objectCoords-HAT").innerHTML = xpos + ", " + ypos;

//     // const circle = {
//     //     x: 200,
//     //     y: 200,
//     //     size: 15,
//     // }

//     // function drawCircle() {
//     //     ctx.beginPath()
//     //     ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2)
//     //     ctx.fillStyle = "red"
//     //     ctx.fill()
//     // }

//     function animate() {
//         let distance
        
//         // Initialization
//         window.requestAnimationFrame(animate);
//         ctx.fillStyle = "white";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
//         // player.position.x = xpos + player.minVelocity
//         // player.position.y = ypos + player.minVelocity
//         player.update();
//         agent.update()
//         // enemy.update();

//         // player.velocity = 0
//          // player.velocity.x = 0;
//          // player.velocity.y = 0;

//         // console.log('The last key pressed was: ' + player.lastKey)

//         distance = Math.sqrt(((player.position.x - agent.position.x) ^ 2) + ((player.position.y - agent.position.y) ^2))
//         console.log("The distance is:" + distance)
//         if (distance !== 0) {
//             agent.angle = Math.atan2(player.position.y - agent.position.y, player.position.x - agent.position.x) * 180.0 / Math.PI

//             agent.velocity.x = Math.min(player.velocity.x + player.acceleration, agent.maxVelocity )
//         }

//         // Player Movement
//         if (keys.d.pressed) {
//             player.angle -= player.rotationVel
//             console.log('Angle: ' + player.angle)
//         } else if (keys.a.pressed) {
//             player.angle += player.rotationVel
//             console.log('Angle: ' + player.angle)
//         }
        
//         if (keys.w.pressed) {
//             player.velocity.x = Math.min(player.velocity.x + player.acceleration, player.maxVelocity)
//             // console.log('Acceleration: ' + player.acceleration + ' Velocity: ' + player.velocity.x)
//         }

//         if (!keys.w.pressed) {
//             player.velocity.x = Math.max(player.velocity.x - player.acceleration, 0)
//             // console.log('Acceleration: ' + player.acceleration + ' Velocity: ' + player.velocity.x)
//         } 

//         // if (!keys.s.pressed) {
//         //     player.velocity.x = Math.min(player.velocity.x + player.acceleration, 0)
//         //     console.log('Acceleration: ' + player.acceleration + ' Velocity: ' + player.velocity.x)
//         // }
        
//         // if (!keys.a.pressed) {
//         //     player.angle = Math.max(player.angle - player.rotationVel, 0)
//         // }

//         // if (!keys.d.pressed && player.lastKey == "d") {
//         //     player.angle = Math.min(player.angle + (player.rotationVel / 10), 0)
//         //     console.log('Angle not pressed Input d: ' + player.angle - player.rotationVel)
//         // }

//         // if (!keys.a.pressed && player.lastKey == "a") {
//         //     player.angle = Math.max(player.angle - (player.rotationVel / 10), 0)
//         //     console.log('Angle not pressed Input a: ' + player.angle - player.rotationVel)
//         // }

//         // player.velocity.x = 0;
//         // enemy.velocity.x = 0;

//     }

    


//     animate()

    


// }