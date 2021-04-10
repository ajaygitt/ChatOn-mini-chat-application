var express = require('express');
var router = express.Router();
var userHelper = require('../controller/userHelper')

/* GET home page. */
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/')
  }
}
router.get('/', function (req, res, next) {
  if (req.session.loggedIn) {
    res.redirect('/allUsers')
  }
  else {
    res.render('loginPage', { 'mob': req.session.logMob, 'psd': req.session.logPsd });
    req.session.logMob = false
    req.session.logPsd = false
  }
});
router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/allUsers')
  }
  else {
    res.render('signupPage', { 'mobErr': req.session.mob, 'emailErr': req.session.email })
    req.session.mob = false
    req.session.email = false
  }

})
router.post('/login', (req, res) => {
  console.log(req.body);
  userHelper.login(req.body).then((result) => {
    if (result.success) {
      console.log("Success Login");
      req.session.user = result.user
      req.session.loggedIn = true;
      res.redirect('/allUsers')
    }
    if (result.invalidPassword) {
      req.session.logPsd = "Invalid Password"
      res.render('loginPage',{loginerr:true})
      console.log("Invalid psd");
    }
    if (result.invalidUser) {
      req.session.logMob = "Invalid User"
      res.redirect('/')
      console.log("Invalid user");
    }
  })
})
router.post('/signup', (req, res) => {
  console.log(req.body);
  userHelper.signup(req.body).then((response) => {
    if (response.insert) {
      console.log("Value Inserted");
      res.redirect('/')
    }
    if (response.email) {
      req.session.email = "Email Already Exists"
      res.redirect('/signup')
      console.log("email already exist");
    }
    else {
      req.session.mob = "Phone Number Already Exists"
      res.redirect('/signup')
      console.log("phone already exist");
    }
  })

})
router.post('/chat', verifyLogin, async (req, res) => {
  

  let senderid=req.query.sender
  let receiverid=req.query.receiver
  console.log("sender id is ",senderid);
  console.log("receiver is ",receiverid);
 let user=receiverid
//  let sender=senderid+receiverid
//  let receiver=receiverid+senderid

let userfound=req.session.user

  let first= senderid.length-24
  let senderis=senderid.slice(0,first)
 let receiveris=receiverid.slice(0,first)
 console.log("sender is this @@@@@@@@@@@@@@@@@@@@###########",senderis);
 console.log("the receiver is %%%%%%%%%%%%%%%%%%",receiveris);

 let recieving_person=await userHelper.getrecipientDetails(receiveris)
let sendChat=await userHelper.sentChat(senderis,receiveris)
let received=await userHelper.receivedChat(receiveris,userfound._id)
let chat=sendChat.concat(received)
console.log("the chat is ))))))",chat );
  res.render('chat',{reciepient:user,chat,recieving_person,userfound})
})






router.get('/allUsers', verifyLogin, async (req, res) => {
  let users = await userHelper.getAllUsers(req.session.user._id)

  res.render('home', { users, sender: req.session.user })
})
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.loggedIn = false
  res.redirect('/')
})
module.exports = router;
