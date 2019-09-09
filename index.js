const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');
require('./models/user');
require('./models/board');
require('./models/hexagon');
require('./services/passport');

mongoose.connect(keys.mongoURI);

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/gameRoutes')(app);


if (process.env.NODE_ENV === 'production') {
  // express will serve up production assets
  // like out main.js or main.css
  app.use(express.static('client/build'));

  // express will serve up the index.html file
  // if it doesn't recognize the route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.use(function(req, res, next) {
  client.on('subscribeToTimer', interval => {
    console.log('client is subscribing to timer with interval ', interval);
    setInterval(() => {
      client.emit('timer', new Date());
    }, interval);
  });
});

io.on('connection', (socket) => {
	console.log('a user connected');
 
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('queue', function(data) {
    console.log("");
    socket.join('queue');
    //console.log(data);
    //console.log(socket.rooms);
    var roster = io.sockets.adapter.rooms['queue'].sockets;
    console.log(roster);
    //console.log(Object.keys(obj).length);
    socket.broadcast.to(data.room).emit('users in queue', {roster: roster, user: data.user});
  });

  socket.on('room', function(data){
    console.log("");
    console.log('in joining room in SERVER');
    socket.join(data.room);
    console.log(data);
  });

  socket.on('leave room', function(data) {
    console.log("leave room", data);
    socket.broadcast.to(data.room).emit("user left room", data)
    socket.leave(data.room)
  });

  socket.on('on change', function(data) {
    console.log("emitting change.....");
    socket.broadcast.to(data.room).emit('update', data);
  });

  socket.on('you lose', function(data){
    console.log("you lose");
    socket.broadcast.to(data.room).emit('i lose', data);
  });
});

const getApiAndEmit = async socket => {
  try {
    socket.emit("FromAPI", "hello"); // Emitting a new message. It will be consumed by the client
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

const PORT = process.env.PORT || 5000;
server.listen(PORT);
console.log('listening on port ', PORT);

// localhost:5000
