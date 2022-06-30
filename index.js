var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;

const port = process.env.PORT || 3000

var rooms = {}; //maintains current state for rooms
var rooms_history = {}; //maintains historical state for point calculation
var room_score = {}; //keeps track of the total score for each room

const url = 'mongodb://localhost:27017';
const uri = "mongodb+srv://gonzad5:Warcraft3dan@cluster0.qbahja0.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'synchromouse';
var mongoClient = undefined;
// MongoClient.connect(url, function(err, client) {
//     mongoClient = client;
//     console.log("Connected to database");
// });

MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {

    if (err) {
        return console.log('Unable to connect to database')
    }
    mongoClient = client;
    console.log("Connected to database");
});
  


app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('begin');
    socket.on('join_room', (room) => {
        console.log(socket.id + ' wants to join ' + room);
        socket.join(room);
        if(!(room in rooms)) {
            rooms[room] = {};
            rooms_history[room] = {};
            room_score[room] = 0;
        }
        rooms[room][socket.id] = {x: 0, y: 0, rotation: 0};
        rooms_history[room][socket.id] = [];
        socket.to(room).emit('location', socket.id, 0, 0, 0);
    });
    socket.on('join_admin', (room) => {
        console.log(socket.id + ' wants to join ' + room + ' as admin');
        socket.join(room);
    });
    socket.on('start', (room) => {
        console.log('game begins in room ' + room);
        room_score[room] = 0;
        io.to(room).emit('end', room_score[room], false);
        setTimeout(() => {
            room_score[room] = 0;
            io.to(room).emit('start');
            if (mongoClient !== undefined) {
                const db = mongoClient.db(dbName);
                db.collection('round_begin').insert({time: new Date(), room: room});
            }
        }, 10000);
        var times = 0;
        var interval = setInterval(() => {
            if (mongoClient !== undefined) {
                const db = mongoClient.db(dbName);
                db.collection('room_scores').insert({time: new Date(), room: room, score: room_score[room]});
            }
            io.to(room).emit('end', room_score[room], false);
            setTimeout(() => {
                room_score[room] = 0;
                io.to(room).emit('start');
                if (mongoClient !== undefined) {
                    const db = mongoClient.db(dbName);
                    db.collection('round_begin').insert({time: new Date(), room: room});
                }
            }, 10000);
            times++;
            if(times > 2) { //amount of rounds
                clearInterval(interval);
                setTimeout(() => {
                    io.to(room).emit('end', room_score[room], true);
                    if (mongoClient !== undefined) {
                        const db = mongoClient.db(dbName);
                        db.collection('room_scores').insert({time: new Date(), room: room, score: room_score[room]});
                    }
                }, 25000);
            }
        }, 25000);
    });
    socket.on('location', (room, x, y, rotation) => {
        socket.to(room).emit('location', socket.id, x, y, rotation);
        if(!(room in rooms)) {
            rooms[room] = {};
            rooms_history[room] = {};
            room_score[room] = 0;
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
    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected");
        for(room in rooms) {
            if(socket.id in rooms[room]) {
                delete(rooms[room][socket.id]);
                delete(rooms_history[room][socket.id]);
                io.to(room).emit('disconnected', socket.id);
            }
        }
    });
});

//calculate points every 100 ms
setInterval(() => {
    for(r in rooms_history) {
        var room = rooms_history[r];
        var min_distance = 999999;
        var mean_x = [];
        var mean_y = [];
        var mean_rot = [];
        var n_players = 0;
        for(p in room) {
            n_players++;
            var player = room[p];
            var distance = 0;
            var prev_location = null;
            mean_x.unshift(0);
            mean_y.unshift(0);
            mean_rot.unshift(null);
            for(var l=0; l < player.length; ++l) {
                var i = parseInt(l);
                var location = player[l];
                if(prev_location !== null) {
                    distance += Math.sqrt(Math.pow(location.x - prev_location.x, 2) + Math.pow(location.y - prev_location.y, 2));
                }
                prev_location = location;
                mean_x[0] += location.x / player.length;
                mean_y[0] += location.y / player.length;
                if(mean_rot[0] === null) mean_rot[0] = location.rotation;
                else {
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
        
        score = n_players * min_distance / (0.01 + max_location_diff);
        if(max_rot_diff > 90) score = 0;
        io.to(r).emit('score', score);
        room_score[r] += score;
    }
}, 100);

http.listen(port, function(){
  console.log(`listening on: ${port}`);
});
