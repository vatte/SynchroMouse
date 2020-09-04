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
        var urlParams = new URLSearchParams(window.location.search);

        if(urlParams.has('room')) {
            room = urlParams.get('room');

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
        var player = document.getElementById(socketId);
        x *= game.offsetWidth;
        y *= game.offsetHeight;
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

    socket.on('score', function(score) {
        score = Math.min(1, score);
        var blue = 255 * (1 - score);
        var green = 191 * (1 - 0.7 * score);// * (1 - score);
        var red = 255 * score;
        game.style.backgroundColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
    });

    socket.on('start', function() {
        console.log('start');
        document.getElementById('info').style.opacity = '0';
    });
    socket.on('end', function(score, finish) {
        document.getElementById('info').style.opacity = 1;
        if(score > hiscore) hiscore = score;
        document.getElementById('previous_score').innerHTML = '' + Math.round(score);
        document.getElementById('high_score').innerHTML = '' + Math.round(hiscore);
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
