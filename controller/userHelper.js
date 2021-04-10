const { USER_COLLECTION, CHAT_COLLECTION } = require("../config/collection");
var db = require("../config/connection");
var objectId = require('mongodb').ObjectID
var collection = require("../config/collection");
var bcrypt = require("bcrypt");
var moment=require('moment')
module.exports = {
  signup: (userData) => {
    status = {};
    return new Promise(async (resolve, reject) => {
      let email = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.Email });
      if (email) {
        status.email = true;
        resolve(status)
      }
     else {
        userData.Password = await bcrypt.hash(userData.Password, 10)
        console.log(userData.Password);
        status.insert = true
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(() => {
          resolve(status);
        });
      }
    });
  },
  login: (userData) => {
     
    return new Promise(async (resolve, reject) => {
      var status = {}
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
      if (user) {
        console.log("here",userData.Password,user.Password);
     await   bcrypt.compare(userData.Password,user.Password).then((result) => {
       console.log("hmm",result);
          if (result) {
            console.log("haha");
            status.user = user
            status.success = true
            console.log("Login Success");
            resolve(status)
          }else {
            status.invalidPassword = true
            resolve(status)
          }

        })
      }
      else {
        status.invalidUser = true
        resolve(status)
      }
    })
  },
  getAllUsers:(user)=>
  {
    return new Promise(async(resolve,reject)=>
    {
    
     let  users = await db.get().collection(collection.USER_COLLECTION).find({_id:{$ne:objectId(user)}}).toArray()
      resolve(users)
      console.log("usrs",users);
    })
  },
  insertChat:(chatData)=>
  {
    const format ="YYYY-MM-DD HH:mm:ss"
    console.log("in chat inserttt",chatData);

  
 let first= chatData.sender.length-24
 let senderis=chatData.sender.slice(0,first)
let receiveris=chatData.receiver.slice(0,first)
console.log("sender is this @@@@@@@@@@@@@@@@@@@@###########",senderis);
console.log("the receiver is %%%%%%%%%%%%%%%%%%",receiveris);
    return new Promise(async(resolve,reject)=>
    {  let user={}
    
      let date=new Date()
   date=moment(date).format(format)
      console.log("date isss",date);

 user=await db.get().collection(USER_COLLECTION).findOne({_id:objectId(senderis)})
console.log("the user is",user);
    await  db.get().collection(collection.CHAT_COLLECTION).insertOne({message:chatData.message,
        sender:senderis,
        receiver:receiveris,
        Date:date,
        sendername:user.name
      })
      resolve()
    })
  },





insertImage:(chatData)=>{
console.log("ethiii");
return new Promise(async(resolve,reject)=>{

 
  let first= chatData.sender.length-24
  let senderis=chatData.sender.slice(0,first)
 let receiveris=chatData.receiver.slice(0,first)
 console.log("sender is this @@@@@@@@@@@@@@@@@@@@###########",senderis);
 console.log("the receiver is %%%%%%%%%%%%%%%%%%",receiveris);

  let date=new Date()
  const format ="YYYY-MM-DD HH:mm:ss"
   date=moment(date).format(format)
      console.log("date isss",date);
      user=await db.get().collection(USER_COLLECTION).findOne({_id:objectId(senderis)})

  await db.get().collection(CHAT_COLLECTION).insertOne({
    sender:senderis,
    receiver:receiveris,
    Date:date,
    image:chatData.image,
    sendername:user.name

  })
})
},




  sentChat:(sender,receiver)=>
  {
    console.log(sender,receiver);
    return new Promise(async(resolve,reject)=>
    {
    let chat =await db.get().collection(CHAT_COLLECTION).find({$and:[{sender:sender,receiver:receiver}]}).toArray()
if(chat)
{
  resolve(chat)

  console.log("the chat send is ",chat);
}
else
{
  resolve()
}

    })
  },


   receivedChat:(sender,reciever)=>{
return new Promise(async(resolve,reject)=>{

 let chat=await db.get().collection(CHAT_COLLECTION).find({$and:[{sender:sender,receiver:reciever}]}).toArray()

 if(chat)
 {
   console.log("the recieved chat is ",chat);
   resolve(chat)
 }
 else
 {
   resolve()
 }
})

   },









  getrecipientDetails:(receiver)=>{
    return new Promise(async(resolve,reject)=>{

      let recieve=await db.get().collection(USER_COLLECTION).findOne({_id:objectId(receiver)})
      if(recieve)
      {
        console.log("asj",recieve);
        resolve(recieve)
      }
      else
      {
        console.log("nooooooo receiver");
      }
    })
  },



  insertVideo:(chatData)=>{

    console.log("hai peoples");
    return new Promise(async(resolve,reject)=>{

     
  let first= chatData.sender.length-24
  let senderis=chatData.sender.slice(0,first)
 let receiveris=chatData.receiver.slice(0,first)
 console.log("sender is this @@@@@@@@@@@@@@@@@@@@###########",senderis);
 console.log("the receiver is %%%%%%%%%%%%%%%%%%",receiveris);

  let date=new Date()
  const format ="YYYY-MM-DD HH:mm:ss"
   date=moment(date).format(format)
      console.log("date isss",date);
      user=await db.get().collection(USER_COLLECTION).findOne({_id:objectId(senderis)})
  await db.get().collection(CHAT_COLLECTION).insertOne({
    sender:senderis,
    receiver:receiveris,
    Date:date,
    video:chatData.video,
    sendername:user.name

  })
    })
  }



}
