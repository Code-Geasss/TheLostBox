const express = require('express');
const http = require("http");
const app = express();

const server =http.createServer(app);
const io = require("socket.io").listen(server);

const mongoose = require('mongoose');
var createError = require('http-errors');
const morgan = require('morgan');
var path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
const passport = require('passport');

const flash = require('connect-flash');
const dotenv = require('dotenv');
dotenv.config();

require('./config/passport');

const PORT = process.env.PORT || 5000;  
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/Test1")
.then(() => console.log('db connected'));

mongoose.connection.on('error', err => {
    console.log(`DB Error: ${err.message}`);
});




const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
//const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use("/images",express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'assets')));


const Socket = require('./models/socket');
const Chat = require('./models/chat');


io.on('connection', async (socket) => {
    console.log('CLIENT CONNECTED')
    socket.on('userInfo',(user) => {
        console.log(user);
        Socket.findOne({email: user.email}, function(err,res) {
            if(!res){
                let newSocket = new Socket({
                    socketId: socket.id,
                    user: user,
                    email: user.email
                })
                newSocket.save((err,result) => {
                    if(err){
                        console.log(err)
                    } else {
                        console.log("ADDED TO DB ", socket.id)
                    }
                })
            } else {
                Socket.findOneAndUpdate({email: user.email} ,{$set: {"socketId": socket.id}}, (err,result) => {
                    if(err){
                        console.log(err)
                    }else{
                        console.log("UPDATED");
                    }
                })
            }   
        })
    });

    socket.on('sendMessage', (message, sender, receiver, callback) => {
        const senderId = sender._id;
        const receiverId = receiver._id;
        Socket.findOne({email: receiver.email})
        .exec(async function(err,res) {
            if(res!=null){
                console.log("SENT")
                const newChat = new Chat({
                    message,
                    receiver,
                    sender
                });
                await newChat.save((err,result) => {
                    if(err){
                        console.log(err)
                    } else {
                        console.log("--------------------------------");
                        console.log("CHAT SAVED");
                        console.log("--------------------------------");
                    }
                })
                // const allChats = await Chat.find({ $or: [{ 'receiver._id': receiverId, 'sender._id': senderId },{ 'sender._id': receiverId, 'receiver._id': senderId }] })
                console.log("emitting online")
                io.to(res.socketId).emit('message', newChat);
                socket.emit('message', newChat);

            } else {
                const newChat = new Chat({
                    message,
                    receiver,
                    sender
                });
                await newChat.save((err,result) => {
                    if(err){
                        console.log(err)
                    } else {
                        console.log("--------------------------------");
                        console.log("OFFLINE CHAT SAVED");
                        console.log("--------------------------------");
                    }
                })
                // const allChats = await Chat.find({ $or: [{ 'receiver._id': receiverId, 'sender._id': senderId },{ 'sender._id': receiverId, 'receiver._id': senderId }] })
                console.log("emitting offline")
                //console.log(newChat);
                socket.emit('message', newChat);
            }
        })
        callback();
    });
    socket.on('refresh', function(){
        io.emit('new refresh', {});
    });
    socket.on('disconnect', () => {
        Socket.findOne({socketId: socket.id})
        .remove((err, result) => {
            if(err){
                console.log(err)
            } else {
                console.log("DELETED");
            }
        })
        console.log("DISCONNECTED")
    });
});

app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }/* 180 minutes */ 
  }));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.session = req.session;
    next();
  });

app.use(authRoutes);
app.use(postRoutes);
app.use(chatRoutes);



app.use(function(err,req,res,next){
    if(err.name === 'UnauthorizedError'){
        res.status(401).json({ error: "Unauthorized !" });
    }
});

server.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
})