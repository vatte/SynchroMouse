var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient;
const curveMatcher = require("curve-matcher")
// const paper = require("paper")
const smoothCurve = require("chaikin-smooth")
// const {makeid} = require('./utils')
let playPositions = []
let speedXPlayer = []
let speedYPlayer = []
let accelXPlayer = []
let accelYPlayer = []
let jerkXPlayer = []
let jerkYPlayer = []

let agePositions = []
let accelXAgent = []
let accelYAgent = []
// Competence Measurements
let speedXAgent = []
let speedYAgent = []
let jerkXAgent = []
let jerkYAgent = []
let rotationPlayer = []




// Predictability Measurements
let rotationAgent = []
let curvatureAgent = []
let curvaturePlayer  = []
let agePositions2 = []

// let rotDifferencesWaveAgent = []
// let rotDifferencesIdealAgent = []
let rotDifferencesPlayer = []

// let velocityAgentWaves = []
// let velocityAgent = []
// let velocityPlayer = []

let amountSharpTurnsAgent
let amountSharpTurnsPlayer = 0

// let prevAgePositions = []
// let prevAgePositions2 = []
// let prevPlayPositions = []
let roundBeginning = false
let totalGameTime = 30000
// let playing = false
// let playerPositionsTest = []
// let agentPositionsTest = []
// let agent2PositionsTest= []
let dataPlayer = []
let dataAgent = []

const port = process.env.PORT || 3000

const rooms = {}; //maintains current state for rooms
const rooms_history = {}; //maintains historical state for point calculation
const room_score = {}; //keeps track of the total score for each room

let arrayTest = []

// Experiment Scores
let room_predictability = {}
let room_integrity = {}
let room_competence = {}

// let smoothFinal = []
// let smoothAgentFinal = []

const url = 'mongodb://localhost:27017';
// const uri = "mongodb+srv://gonzad5:Warcraft3dan@cluster0.qbahja0.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'synchromouse';
var mongoClient = undefined;
// MongoClient.connect(url, function(err, client) {
//     mongoClient = client;
//     console.log("Connected to database");
// });

// MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {

//     if (err) {
//         return console.log('Unable to connect to database')
//     }
//     mongoClient = client;
//     console.log("Connected to database");
// });
  


app.use(express.static('public'));

// Open connection when a player connects.
io.on('connection', (socket) => {
    console.log('a user connected');
    // Emits the begin event.
     socket.emit('begin');


    // Opens connection when 
    socket.on('join_room', (room) => {
        console.log(socket.id + ' wants to join ' + room);
        socket.join(room);
        // Possible future modification in terms of one player (human) per room.
        if(!(room in rooms)) {
            // Initialization of parameters and scores.
            rooms[room] = {};
            rooms_history[room] = {};
            room_score[room] = 0;
            // Measurements for each of the rooms.
            room_predictability[room] = 0
            // room_integrity[room] = 0
            room_competence[room] = 0
        }
        // Introduction of the initial position for the player with their rooms list and history.
        rooms[room][socket.id] = {x: 0, y: 0, rotation: 0};
        rooms_history[room][socket.id] = [];
        // Emits location event to the particular room.
        socket.to(room).emit('location', socket.id, 0, 0, 0);
    });


    // When an admin wants to enter the room.
    socket.on('join_admin', (room) => {
        console.log(socket.id + ' wants to join ' + room + ' as admin');
        socket.join(room);
    });

    // let roundTime = 30000
    // When the game begins.
    socket.on('start', (room) => {
        console.log('game begins in room ' + room);
        room_score[room] = 0;
        // Initialization of scores.
        room_predictability[room] = 0
        // room_integrity[room] = 0
        room_competence[room] = 0
        // Return to the initial state.
        socket.emit('end', false);

        setTimeout(() => {
            room_score[room] = 0;
            // Initialization of scores.
            room_predictability[room] = 0
            // room_integrity[room] = 0
            room_competence[room] = 0
            //Emit start when the countdown ends.
            roundBeginning=true
            socket.emit('beginGame', roundBeginning)
            socket.to(room).emit('start');
            if (mongoClient !== undefined) {
                const db = mongoClient.db(dbName);
                db.collection('round_begin').insert({time: new Date(), room: room});
            }
        }, 10000);
        // Amount of rounds a player will play the mirror game.
        var times = 0;

        var interval = setInterval(() => {
            if (mongoClient !== undefined) {
                const db = mongoClient.db(dbName);
                db.collection('room_scores').insert({time: new Date(), room: room, score: room_score[room],
                    competence: room_competence[room], predictability: room_predictability[room], integrity: room_integrity[room]});
            }
            roundBeginning = false
            socket.emit('beginGame', roundBeginning)
            socket.emit('end', false);
            setTimeout(() => {
                room_score[room] = 0;
                // Finalization of scores.
                room_predictability[room] = 0
                // room_integrity[room] = 0
                room_competence[room] = 0
                // playPositions = []
                // agePositions = []
                roundBeginning=true
                socket.emit('beginGame', roundBeginning)
                socket.emit('start');
                if (mongoClient !== undefined) {
                    const db = mongoClient.db(dbName);
                    db.collection('round_begin').insert({time: new Date(), room: room});
                }
            }, 10000);
            times++;
            
        //     let counterTimeTotal = 0
        //     setInterval(() => {
        //         console.log("The shape similarity (competence) is: " + curveMatcher.shapeSimilarity(agePositions,playPositions))
        //         console.log("The frechet distance is: " + curveMatcher.frechetDistance(agePositions, playPositions))
        //         counterTimeTotal ++
        //         console.log("The amount of messages is: " + counterTimeTotal)
        //         // room_competence[room] = curveMatcher.shapeSimilarity(agePositions,playPositions)
        //         playPositions = []
        //         agePositions = []
        //     // console.log(playPositionsPrev)
        //     // console.log(playPositions)
           
        //      // console.log(agePositions)
        //  }, 1000);
            console.log("Times are: " + times)
            if(times > 2) { //amount of rounds
                clearInterval(interval);
                setTimeout(() => {
                    roundBeginning = false
                    socket.emit('beginGame', roundBeginning)
                    socket.emit('end', true);
                    console.log("We entered the end.")
                    // let data = JSON.stringify(scores)
                    let finalDataPlayer = JSON.stringify(dataPlayer)
                    // let textFile = 'scores'+ room + '.json'
                    let textFilePlayer = 'scores_player_'+ socket.id + '.json'
                    fs.writeFile(textFilePlayer, finalDataPlayer, err => {
                    if (err) {
                        throw err
                    } else {
                        console.log('successful upload')
                    }
                        console.log('JSON data player is saved.')
                    })

                    let finalDataAgent = JSON.stringify(dataAgent)
                    // let textFile = 'scores'+ room + '.json'
                    let textFileAgent = 'scores_agent_'+ socket.id + '.json'
                    fs.writeFile(textFileAgent, finalDataAgent, err => {
                    if (err) {
                        throw err
                    } else {
                        console.log('successful upload')
                    }
                        console.log('JSON data agent is saved.')
                    })




                    // let textFile
                    if (mongoClient !== undefined) {
                        const db = mongoClient.db(dbName);
                        db.collection('room_scores').insert({time: new Date(), room: room, score: room_score[room],
                            competence: room_competence[room], predictability: room_predictability[room], integrity: room_integrity[room]});
                    }
                }, totalGameTime);
            }
        }, totalGameTime);

        let counterTimeTotal = 0
        // setInterval(() => {
            // console.log("The shape similarity (competence) is: " + curveMatcher.shapeSimilarity(agePositions,playPositions))
            // console.log("The frechet distance is: " + curveMatcher.frechetDistance(agePositions, playPositions))
            // counterTimeTotal ++
            // console.log("The amount of messages is: " + counterTimeTotal)
            // playPositions = []
            // agePositions = []
           // console.log(playPositionsPrev)
           // console.log(playPositions)
           
           // console.log(agePositions)
       // }, 1000);


    });

    // Definition of the location socket.

    socket.on('locationAgent', (room, x, y, rotation, speedX, speedY, accelX, accelY, jerkX, jerkY) => {
        if (roundBeginning) {
            socket.to(room).emit('location', socket.id, x, y)
            // Positions data structure
            curvatureAgent.push(Math.abs((speedX * accelY) - (accelX * speedY)) / (((speedX ** 2) + (speedY ** 2)) ** (3/2)))
            agePositions.push({x: x, y: y})
            speedXAgent.push(speedX)
            speedYAgent.push(speedY)
            accelXAgent.push(accelX)
            accelYAgent.push(accelY)
            jerkXAgent.push(jerkX)
            jerkYAgent.push(jerkY)
            // Rotation data structure
            rotationAgent.push(rotation)
            if (Math.abs(rotation) >= 90) {
                amountSharpTurnsAgent ++
            }
            
            

        }
    })

    socket.on('locationPlayer', (room, x, y, rotation, speedX, speedY,
        accelX, accelY, jerkX, jerkY) => {
        io.to(room).emit('locationPlayer', socket.id, x, y, rotation);
        // console.log("The position in x is: " + x)
        // console.log(`The registered position in x: ${x} and Position in Y: ${y}`)

        if (roundBeginning) {
            socket.to(room).emit('location', socket.id, x, y)
            // Positions data structure
            curvaturePlayer.push(Math.abs((speedX * accelY) - (accelX * speedY)) / (((speedX ** 2) + (speedY ** 2)) ** (3/2)))
            playPositions.push({x: x, y: y})
            speedXPlayer.push(speedX)
            speedYPlayer.push(speedY)
            accelXPlayer.push(accelX)
            accelYPlayer.push(accelY)
            jerkXPlayer.push(jerkX)
            jerkYPlayer.push(jerkY)
            // Rotation data structure
            rotationPlayer.push(rotation)
            if (Math.abs(rotation) >= 90) {
                amountSharpTurnsAgent ++
            }
            
            

        }



       
        if(!(room in rooms)) {
            rooms[room] = {};
            rooms_history[room] = {};
            room_score[room] = 0;
            // Initialization of scores.
            room_predictability[room] = 0
            // room_integrity[room] = 0
            room_competence[room] = 0
        }
        if(!(socket.id in rooms[room])) {
            rooms[room][socket.id] = {x: 0, y: 0, rotation: 0};
            rooms_history[room][socket.id] = [];
        }
        rooms_history[room][socket.id].push({x: x, y: y, rotation: rotation});
        rooms[room][socket.id] = {x: x, y: y, rotation: rotation};

        if(mongoClient !== undefined) {
            const db = mongoClient.db(dbName);
            db.collection('locations').insert({time: new Date(), room: room, socketId: socket.id, x: x, y: y, rotation: rotation});
        }
    });

    socket.on('calculateMeasuresPlayer', (room) => {
        if (roundBeginning) {


            // let predictabilityPlayerTurns =  amountSharpTurnsPlayer / rotDifferencesPlayer.length
            

            // WRITE THE JSON FILE
           let metricsPlayer = {
            time: new Date(), 
            room: room,
            // predictabilityPlayer: predictabilityPlayerTurns,
            velocityXPlayer: speedXPlayer,
            velocityYPlayer: speedYPlayer,
            accelerationXPlayer: accelXPlayer,
            accelerationYPlayer: accelYPlayer,
            jerkXPlayer: jerkXPlayer,
            curvaturePlayer: curvaturePlayer
           }

           dataPlayer.push(metricsPlayer)

           playPositions = []
           // rotDifferencesIdealAgent = []
           rotationPlayer = []
           speedXPlayer = []
           speedYPlayer = []
           accelXPlayer = []
           accelYPlayer = []
           jerkXPlayer = []
           jerkYPlayer = []
           
           
           amountSharpTurnsPlayer = 0
        }
            
        
    })

    socket.on('calculateMeasuresAgent', (room) => {
        if (roundBeginning) {
            let predictabilityAgentTurns = amountSharpTurnsAgent / rotationAgent.length

            // WRITE THE JSON FILE
           let metricsAgent = {
            time: new Date(), 
            room: room,
            // predictabilityAgent: predictabilityAgentTurns,
            velocityXAgent: speedXAgent,
            velocityYAgent: speedYAgent,
            accelerationXAgent: accelXAgent,
            accelerationYAgent: accelYAgent,
            jerkXAgent: jerkXAgent,
            jerkYAgent: jerkYAgent,
            curvatureAgent: curvatureAgent
          }


          dataAgent.push(metricsAgent)


        agePositions = []
        predictabilityAgentTurns = []
        speedXAgent = []
        speedYAgent = []
        accelXAgent = []
        accelYAgent = []
        jerkXAgent = []
        jerkYAgent = []
        curvatureAgent = []
        


          amountSharpTurnsAgent = 0

        }
    })

    socket.on('calculateMeasures', (room) => {
        
        if (roundBeginning) {

            // let pathTest = new paper.Path({
            //     segments: playPositions
            // })
            // let averageDistance= []
            // let smooth = smoothCurve(playerPositionsTest)
            // let smooth2 = smoothCurve(agentPositionsTest)
            // console.log(smooth[10])
            // console.log(playPositions[10])

            // for (let i = 0; i < smooth.length-1; i++) {
            //     averageDistance.push([playerPositionsTest[i][0]-smooth[i][0], playerPositionsTest[i][1]-smooth[i][1]])
            // }
            // console.log(averageDistance)
            // console.log(`The length of the playerPositions is: ${playerPositionsTest.length} and the smooth curve is: ${smooth.length} `)
            // console.log(smooth)
            // if (!isNaN(playerPositionsTest)) {
                
                // console.log(playerPositionsTest[10][0]- smooth[10][0])
                // console.log(`Player Test position: ${playerPositionsTest[10][0]} and smooth curve: ${smooth[10][0]}`)
            // }

            // for (let index = 0; index < smooth.length-1; index++) {
            //     smoothFinal.push({x: smooth[index][0], y: smooth[index][1]})
            // }

            // for (let index = 0; index < smooth2.length-1; index++) {
            //     smoothAgentFinal.push({x: smooth2[index][0], y: smooth2[index][1]})
                
            // }

            // console.log(`First element of smooth: ${smooth[0]} versus ${smooth[0][0]} and ${smooth[0][1]}`)
            // console.log(`The difference with first element is: ${playerPositionsTest[10]-playPositions[10]}`)
            
            
            // let balancedCurved1 =curveMatcher.subdivideCurve(agePositions, {numPoints: 50})
            // let balancedCurved11 = curveMatcher.subdivideCurve(agePositions2, {numPoints: 50})

            // let balancedCurved2 =curveMatcher.subdivideCurve(playPositions, {numPoints: 50})

            // let normalizedCurve1 = curveMatcher.procrustesNormalizeCurve(balancedCurved1)
            // let normalizedCurve11 = curveMatcher.procrustesNormalizeCurve(balancedCurved11)

            // let normalizedCurve2 = curveMatcher.procrustesNormalizeCurve(balancedCurved2)

            // let dist = curveMatcher.frechetDistance(normalizedCurve1, normalizedCurve2)
            // let dist2 = curveMatcher.frechetDistance(normalizedCurve11, normalizedCurve2)
            
            // let curveLen1 = curveMatcher.curveLength(normalizedCurve1)
            // let curveLen11 = curveMatcher.curveLength(normalizedCurve11)

            // let curveLen2 = curveMatcher.curveLength(normalizedCurve2)

            // let maxCurveLen = Math.max(curveLen1, curveLen2)
            // let maxCurveLen2 = Math.max(curveLen11, curveLen2)

            // let similarityNoRot = 1 - dist/ maxCurveLen
            // let similarityNoRot2 = 1 - dist2/ maxCurveLen2

            // let similarity = curveMatcher.shapeSimilarity(agePositions,playPositions)
            // let similarity2 = curveMatcher.shapeSimilarity(agePositions2,playPositions)

            // let distance = curveMatcher.frechetDistance(agePositions, playPositions)
            // let distance2 = curveMatcher.frechetDistance(agePositions2, playPositions)

            // if (isNaN(similarity)) {
            //     similarity = 1
            // }


            // let balancedCurve1Sm = curveMatcher.subdivideCurve(playPositions, { numPoints: 50 });
            // let balancedCurve2Sm = curveMatcher.subdivideCurve(smoothFinal, { numPoints: 50 });

            // let normalizedCurve1Sm = curveMatcher.procrustesNormalizeCurve(balancedCurve1Sm);
            // let normalizedCurve2Sm = curveMatcher.procrustesNormalizeCurve(balancedCurve2Sm);

            // let distSm = curveMatcher.frechetDistance(normalizedCurve1Sm, normalizedCurve2Sm);

            // let curveLen1Sm = curveMatcher.curveLength(normalizedCurve1Sm)
            // let curveLen2Sm = curveMatcher.curveLength(normalizedCurve2Sm)
            // let maxCurveLenSm = Math.max(curveLen1Sm, curveLen2Sm);

            // similarity == 1 means the curves have identical shapes
            // const similaritySm = 1 - distSm / maxCurveLenSm;

            // console.log(`The similarity without rotation is: ${similaritySm} and the distance is: ${distSm}`)

            // let similaritySmooth = curveMatcher.shapeSimilarity(smoothFinal,playPositions)
            // console.log(similaritySmooth)
            // if (isNaN(similaritySmooth)) {
            //     similaritySmooth = 1
            //     console.log("Entered NAN")
            // }

            // let similaritySmoothAgent = curveMatcher.shapeSimilarity(smoothFinal,playPositions)
            // console.log(similaritySmoothAgent)
            // if (isNaN(similaritySmoothAgent)) {
            //     similaritySmoothAgent = 1
            //     console.log("Entered NAN")
            // }

            // Measure of Sharp Turns Players and Agents

            let predictabilityPlayerTurns =  amountSharpTurnsPlayer / rotDifferencesPlayer.length
            let predictabilityAgentTurns = amountSharpTurnsAgent / rotationAgent.length
            
            // let competenceSmoothnessIdeal = amountSharpTurnsIdeal / rotDifferencesIdealAgent.length
            

            // let predPerson
            // let predAgent
            // let predAgent2

        //     if (prevPlayPositions.length !== 0 && prevAgePositions.length !== 0) {
        //         predPerson = curveMatcher.shapeSimilarity(prevPlayPositions,playPositions)
        //         predAgent = curveMatcher.shapeSimilarity(prevAgePositions, agePositions)
        //    } else {
        //        predPerson = 1
        //        predAgent = 1
        //    }

        //    if (prevPlayPositions.length !== 0 && prevAgePositions2.length !== 0) {
        //         // predPerson = curveMatcher.shapeSimilarity(prevPlayPositions,playPositions)
        //         predAgent2 = curveMatcher.shapeSimilarity(prevAgePositions2, agePositions2)
        //     } else {
        //         // predPerson = 1
        //         predAgent2 = 1
        //     }

        //    if (isNaN(predPerson)) {
        //         predPerson = 1
        //    }

        //    if (isNaN(predAgent)) {
        //         predAgent = 1
        //    }

        //    if (isNaN(predAgent2)) {
        //         predAgent2 = 1
        //    }

        //    console.log(`The similarity is: ${similarity} and the distance is: ${distance}`)
            //console.log(smooth)
            // console.log(`The similarity with the smooth curve is: ${similaritySmooth} and agent is: ${similaritySmoothAgent}`)
           // socket.emit('scoresSimilar', similarity.toFixed(3) , distance.toFixed(3), predPerson.toFixed(3), predAgent.toFixed(3), similarityNoRot.toFixed(3), dist.toFixed(3))
           socket.emit('scoresSimilar', predictabilityPlayerTurns, predictabilityAgentTurns)
           // console.log(`The amount of sharp turns for the player is: ${amountSharpTurnsPlayer}, for the wave agent: ${amountSharpTurnsWaves} and the ideal agent: ${amountSharpTurnsIdeal}`)
           // console.log(`The competence in smoothness of the player is: ${competenceSmoothPlayer.toFixed(3)}, for the wave agent: ${competenceSmoothWaveAgent.toFixed(3)} and the ideal agent: ${competenceSmoothnessIdeal.toFixed(3)}`)
           // WRITE THE JSON FILE
           let scores = {
            time: new Date(), 
            room: room,
            // score: room_score[room],
            // shapeSimilarityNormRot: similarity.toFixed(3),
            // shapeSimilarityNoRot: similarityNoRot.toFixed(3),
            // predictabilityHuman: predPerson.toFixed(3),
            // predictabilityAgent: predAgent.toFixed(3),
            // competenceSmoothness: competenceSmoothPlayer.toFixed(3),
            // competenceSmoothnessWaves: competenceSmoothWaveAgent.toFixed(3)
            predictabilityPlayer: predictabilityPlayerTurns,
            predictabilityAgent: predictabilityAgentTurns,
            velocityAgent: speedAgent,
            jerkAgent: jerkAgent
           }

        //    let scores2 = {
        //     time: new Date(),
        //     room: room,
        //     shapeSimilarityNormRot: similarity2.toFixed(3),
        //     shapeSImilarityNoRot: similarityNoRot2.toFixed(3),
        //     // predictabilityHuman: predPerson.toFixed(3),
        //     predictabilityAgent: predAgent2.toFixed(3),
        //     competenceSmoothnessIdeal: competenceSmoothnessIdeal.toFixed(3)
        //    }


           dataAgent.push(scores)
           // data.resultsAgent2.push(scores2)

           prevPlayPositions = playPositions
        
           prevAgePositions = agePositions
           prevAgePositions2 = agePositions2

           playPositions = []
           // rotDifferencesIdealAgent = []
           rotDifferencesPlayer = []
           rotationAgent = []
           // rotDifferencesWaveAgent = []

           velocityAgent = []
           velocityPlayer = []

           speedAgent = []
           accelAgent = []
           jerkAgent = []
           
           agePositions = []
           agePositions2 = []

           playerPositionsTest = []
           smoothFinal = []
           smooth = []
           smooth2 = []
           smoothAgentFinal = []
           // amountSharpTurnsIdeal = 0
           amountSharpTurnsAgent = 0
           amountSharpTurnsPlayer = 0
        }
        
    })

    // setInterval(() => {
    //     // console.log("The shape similarity (competence) is: " + curveMatcher.shapeSimilarity(agePositions,playPositions))
    //     // console.log("The frechet distance is: " + curveMatcher.frechetDistance(agePositions, playPositions))
    //     // counterTimeTotal ++
    //     // console.log("The amount of messages is: " + counterTimeTotal)
    //     socket.to(room).emit('scoresSimilar', room, curveMatcher.shapeSimilarity(agePositions,playPositions), curveMatcher.frechetDistance(agePositions, playPositions) )
    //     playPositions = []
    //     agePositions = []
    //    // console.log(playPositionsPrev)
    //    // console.log(playPositions)
       
    //    // console.log(agePositions)
    // }, 1000);

    


    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected");
        roundBeginning = false 
        for(room in rooms) {
            if(socket.id in rooms[room]) {
                delete(rooms[room]);
                delete(rooms_history[room]);
                io.to(room).emit('disconnected', socket.id);
            }
        }
    });
});


let registerTime = 100
//Calculation of points in a set period of time.
//calculate points every 100 ms
// setInterval(() => {
//      console.log("The shape similarity (competence) is: " + curveMatcher.shapeSimilarity(agePositions,playPositions))
//      console.log("The frechet distance is: " + curveMatcher.frechetDistance(agePositions, playPositions))
//      // playPositions = []
//      // agePositions = []
//     // console.log(playPositionsPrev)
//     // console.log(playPositions)
    
//     // console.log(agePositions)
// }, 10000);

// setInterval(() => {
//     // console.log("The shape similarity (competence) is: " + curveMatcher.shapeSimilarity(agePositions,playPositions))
//     // console.log("The frechet distance is: " + curveMatcher.frechetDistance(agePositions, playPositions))
//     // counterTimeTotal ++
//     // console.log("The amount of messages is: " + counterTimeTotal)
//     io.to(room).emit('scoresSimilar', curveMatcher.shapeSimilarity(agePositions,playPositions), curveMatcher.frechetDistance(agePositions, playPositions) )
//     playPositions = []
//     agePositions = []
//    // console.log(playPositionsPrev)
//    // console.log(playPositions)
   
//    // console.log(agePositions)
// }, 1000);
setInterval(() => {
    // console.log(playPositions)
    // playPositionsPrev = playPositions
    for(r in rooms_history) {
        var room = rooms_history[r];
        var min_distance = 999999;
        var mean_x = [];
        var mean_y = [];
        var mean_rot = [];

        // Variables for predictability and integrity.
        // Number of players.
        var n_players = 0;
        // For each player in a room have the definition of the parameters for the scores.
        for(p in room) {
            n_players++;
            var player = room[p];
            var distance = 0;
            var prev_location = null;
            // Introduction of Previous speed and angle.
            let prev_speed = null;
            let prev_angle = null;


            // Obtain angle based on the position.
            // const angleDeg = Math.atan2(mousePosition.y - (canvas.height/2), mousePosition.x - (canvas.width/2)) * 180 / Math.PI;

            mean_x.unshift(0);
            mean_y.unshift(0);
            mean_rot.unshift(null);

            // 
            for(var l=0; l < player.length; ++l) {

                var i = parseInt(l);
                var location = player[l];
                // Condition for the difference of location for the players.
                if(prev_location !== null) {
                    distance += Math.sqrt(Math.pow(location.x - prev_location.x, 2) + Math.pow(location.y - prev_location.y, 2));
                }

                prev_location = location;
                mean_x[0] += location.x / player.length;
                mean_y[0] += location.y / player.length;

                if(mean_rot[0] === null) {
                    mean_rot[0] = location.rotation;
                } else {
                    while(location.rotation - mean_rot[0] > 180) location.rotation -= 360;
                    while(mean_rot[0] - location.rotation > 180) location.rotation += 360;
                    location.rotation = location.rotation;
                    mean_rot[0] = location.rotation / (i + 1) + mean_rot[0] * i / (i + 1);
                }
            }
            min_distance = Math.min(min_distance, distance);
            rooms_history[r][p] = [];
        }
        max_rot_diff = 0;
        max_location_diff = 0;
        for(var i=0; i < mean_rot.length; i++) {
            for(var j=i+1; j < mean_rot.length; j++) {
                rot1 = mean_rot[i];
                rot2 = mean_rot[j];
                if(rot1 !== null && rot2 !== null) {
                    while(rot1 - rot2 > 180) rot1 -= 360;
                    while(rot2 - rot1 > 180) rot1 += 360;
                    max_rot_diff = Math.max(max_rot_diff, Math.abs(rot1 - rot2));
                    max_location_diff = Math.max(max_location_diff, Math.sqrt(Math.pow(mean_x[i] - mean_x[j], 2) + Math.pow(mean_y[i] - mean_y[j], 2)));
                }
            }
        }
        
        score = min_distance / (0.01 + max_location_diff);
        // console.log(score)
        if(max_rot_diff > 90) score = 0;
        io.to(r).emit('score', score);
        room_score[r] += score;
    }
}, registerTime);

http.listen(port, function(){
  console.log(`listening on: ${port}`);
});
