var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var db = require('./config/connection')
var userHelper = require('./controller/userHelper')
var moment = require('moment')
var http = require('http');
var fileupload = require('express-fileupload')
var socketio = require('socket.io')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var msgFormat = require('./chat/message')
var {userJoin,getCurrentUser} = require('./chat/users')
var app = express();
var server = http.createServer(app);
const io = socketio(server)
const getUrls=require('get-urls')

const botName = 'CHATON BOT'
const SocketIOFileUpload=require('socketio-file-upload')
var fs = require('fs')
io.on('connection', socket=>
 {
   var uploader=new SocketIOFileUpload();
   uploader.dir=path.join(__dirname, '/public/image-chats');
  uploader.listen(socket)

   socket.on('joinChat',({sender,receiver})=>
   {
     const user = userJoin(socket.id,sender,receiver)
     socket.join(receiver)
    // socket.emit('message',msgFormat.formatMessage(botName,'Welcome To Juschat'))
  //  socket.broadcast.to(receiver).emit('message',msgFormat.formatMessage(botName,'A user Connected to Chat'))
   })
   

   socket.on('chatMessage',msg =>
   {
    const text = msg;
 
 let url=   getUrls(text);
console.log("the links areee",url);



    if(msg !='')
    {

//url check


     const user = getCurrentUser(socket.id)
     console.log("user at app.js",user);
     console.log("mesasage is",msg);
    
let id=user.id
console.log("hmm",id);
let newReceiver=user.receiver

console.log("ithan sender",user.sender);
console.log("ithan receiver",newReceiver);




io.to(user.sender).emit('message',msgFormat.formatMessage(user.sender,msg))
     io.to(newReceiver).emit('message',msgFormat.formatMessage(newReceiver,msg))
    

     
    let obj={
  socket:id,
      message:msg,
      sender:user.sender,
      receiver:newReceiver,
    }
     console.log("object is",obj);
     userHelper.insertChat(obj)
  }

  else
  {
    console.log("message is nulllllllllll");
  }
   }) 
  



uploader.on("saved",function(event){
  console.log("file ethiyittund",event.file);
  const user = getCurrentUser(socket.id)
  let date=new Date()
  date=moment(date).format("YYYY/MM/DD")
let time=moment(new Date()).format("h:mm:ss")
let reciever=user.receiver
console.log("this is receiver",time);

let uniqueid=moment(new Date()).format("ss")
console.log("uniqu id",uniqueid);
let sender=user.sender
let newimageId=sender+reciever

console.log("the total id is",newimageId);
console.log("the file name",event.file.name);
var file=path.join(__dirname,'/public/image-chats/'+event.file.name)
console.log("the file issss",file);
var ext =path.extname(file)
newimageId=newimageId+uniqueid+ext


var newfileis = path.join(__dirname, '/public/image-chats/'+newimageId)


console.log("new file name is",newimageId);
fs.rename(file,newfileis,(err)=>{
console.log("written the name");
  if(err)
  {
    console.log("err",err);
  }
})
event.file.name=newimageId

let id=user.id
let newReceiver=user.receiver

io.to(user.sender).emit('file', msgFormat.formatFileMessage(user.sender,newimageId,ext))
     io.to(newReceiver).emit('file', msgFormat.formatFileMessage(newReceiver,newimageId,ext))


     if(ext=='.jpg'||ext=='.jpeg'||ext=='.png')
     {
     let messageis={
      socket:id,
      image:newimageId,
      sender:user.sender,
      receiver:newReceiver

     }
     userHelper.insertImage(messageis)
    }

    else if(ext=='.mp4'||ext=='.mkv'||ext=='.webm')
    {
      console.log("ividelum ethio");
      let messageis={
        socket:id,
        video:newimageId,
        sender:user.sender,
        receiver:newReceiver

      }
      userHelper.insertVideo(messageis)
    }
   

})

})


//    socket.on('disconnect',()=>
//    {
//      io.emit('message',msgFormat.formatMessage(botName,'A user has left the Chat'))
//    })


var port = process.env.PORT||5000;
app.set('port', port);
server.listen(port);
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');
app.use(SocketIOFileUpload.router)
app.use(
  session({
    key:'user_id',
    secret:'this is random',
    resave:false,
    saveUninitialized:false,
    cookie:{

      expires:5000000
    }

  })
  );
app.use(fileupload())
  app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  })
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
db.connect((err) => {
  if (err) {
    console.log("Database Connection Error");
  }
  else {
    console.log("Database Connection Success");
  }
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
