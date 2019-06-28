var socket = io();
var room = '';
var game = document.getElementById('game');
var prevX = 0;
var prevY = 0;
var rotation = 0;

socket.on('begin', function() {
    var urlParams = new URLSearchParams(window.location.search)
    if(urlParams.has('room')) {
        room = urlParams.get('room');
        socket.emit('join_room', room);
    }
});

socket.on('location', function(socketId, x, y, rot) {
    var player = document.getElementById(socketId);
    x *= game.offsetWidth;
    y *= game.offsetWidth;
    if(player === null) {
        player = document.createElement('div');
        player.classList.add('player');
        player.id = socketId;
        game.insertBefore(player, document.getElementById('cursor'));
    }
    player.style.left = game.offsetLeft + x - 16;
    player.style.top = game.offsetTop + y - 16;
    player.style.transform = 'rotate(' + rot + 'deg)';
});

socket.on('disconnected', function(socketId) {
    game.removeChild(document.getElementById(socketId));
});

socket.on('score', function(score) {
    console.log(score);
    score = Math.min(1, score);
    var blue = 255 * (1 - score);
    var green = 191 * (1 - 0.7 * score);// * (1 - score);
    var red = 255 * score;
    game.style.backgroundColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
});

game.onmousemove = function(evt) {
    var x = evt.pageX - game.offsetLeft;
    var y = evt.pageY - game.offsetTop;
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
        socket.emit('location', room, x / game.offsetWidth, y / game.offsetWidth, rotation);
        var cursor = document.getElementById('cursor');
        cursor.style.left = x - 16;
        cursor.style.top = y - 16;
        cursor.style.transform = 'rotate(' + rotation +'deg)';
    }
}