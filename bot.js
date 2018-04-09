'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const https = require('https');
var timeout = require('connect-timeout');
const url = 'https://radityop.000webhostapp.com/index.php?nama=';
var echo = { type: 'text', text: 'Untuk sementara fitur yang bisa digunakan hanya: \n\
  dosen(spasi)nama dosen\n\
  Contoh: Dosen Rudi' };
var status=0;
// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);
var log = '';
// create Express app
// about Express itself: https://expressjs.com/
const app = express();
app.use(timeout(120000));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}
var oldLog = console.log;
console.log= function(value){
  log= value;
  oldLog(value);
}


// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {

  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) { 
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  
  client.getProfile(event.source.userId)
    .then((profile) =>{
      console.log(JSON.stringify(profile));
      // global.userId = String(profile.userId);
    }
      );
    oldLog("log:"+log);
    var jsonProfile = JSON.parse(log);
  echo = { type: 'text', text: 'Untuk sementara fitur yang bisa digunakan hanya: \n\
  dosen(spasi)nama dosen\n\
  Contoh: Dosen Rudi' };

  status=1;
  const b = String(event.message.text);
  if(b.toLowerCase().substring(0,5)=='dosen'){
    const cek = '&fungsi=cek';
    var date = new Date();
    var date1 = date.getHours()+7;
    if(date1>=22 && date1<=24){
      echo = { type: 'text', text: 'Untuk fitur pengecekan dosen tidak dapat digunakan pada jam 22:00-24:00'};
      console.log('Hasil: ' + echo.text + ' User: ' + event.source.userId);
      // var pushi = { type: 'text', text: 'Sabar mas'};
      // client.pushMessage(event.source.userId, pushi);
      return client.replyMessage(event.replyToken, echo);
    }
    const namaDosen = b.substring(6);
    if(namaDosen.length<3){
      echo.text = 'Untuk pencarian nama dosen minimal 3 karakter';
      return client.replyMessage(event.replyToken,echo);
    }

    const logging = '&user=' + jsonProfile.displayName + '&userid=' + jsonProfile.userId;
    const urlDosen = url+namaDosen+cek+logging;
    console.log(urlDosen);
    // echo = { type:'text', text: 'Mohon menunggu' };
    // client.replyMessage(event.replyToken,echo);
    status = 0;
    var detik= 0;
    // return client.replyMessage(event.replyToken, echo);
    https.get(urlDosen,res => {
        console.log(res.headers['content-type']);
        // const echo = {type: 'text', text: res.headers['content-type']};
        // return client.replyMessage(event.replyToken, echo);
        if(res.headers['content-type']=='application/json; charset=UTF-8'){
          res.setEncoding('utf8');
          let body = '';
          res.on('data', data=>{
            body += data;
          }); 
          res.on('end', ()=>{
            body = JSON.parse(body);
            console.log(body['hasil']);
            if(body['hasil']=='sukses'){
              if(body['jumlah']>1){
                var str = '';
                var x;
                for(x = 0; x<body['jumlah'];x++){
                  str = str + (x+1) + '. ' + body['nama'][x] + ' (' + body['status'][x] + ')\n';
                }
                echo.text = 'Terdapat ' + body['jumlah'] + ' dosen dengan nama \"' + namaDosen + '\" Yaitu:\n' + str;
              } else{
              echo.text= 'Nama Dosen: ' + body['nama'] + '  Status: ' + body['status'];
              }
            status = 1;}
              // return client.replyMessage(event.replyToken, echo);}
              // message.channel.send("Nama Dosen: " + body['nama'] + "  Status: " + body['status']);}
            else{
              // message.channel.send(body['status']);
              echo ={type:'text',text: body['status']};
              status = 1;
              // return client.replyMessage(event.replyToken, echo);
              }
            }
          );
        } else{
          echo = { type:'text', text: 'Mohon mengulang kembali' };
          status = 1;

          // return client.replyMessage(event.replyToken, hasil);
          // message.channel.send("Mohon mengulang kembali");       
        }
      });
      delay(detik,event.replyToken);
      console.log('Request: ' + b);
      // var bx= 0;
      // while(status== 0){
      //   bx = 1;
      //   console.log('dilewatin');
      // }
      // status=0;
      // return client.replyMessage(event.replyToken, echo);
  } else{

  // use reply API
  status=0;
  return client.replyMessage(event.replyToken, echo);
  }
  // create a echoing text message
  // const echo = { type: 'text', text: b };
  //   return client.replyMessage(event.replyToken, b);
  

} 

 //  if(event.message.text.substring(0,4)==dosen){
 //     const namaDosen = event.message.substring(5);
 //     const dosen = {type:'text',text: 'bisa dosen'};
 //     const echo = { type: 'text', text: 'salahnya dimana1?' };
 //   }
 //  else{
 //   const dosen= {type:'text',text: 'nggak bisa dosen'};
 //   const echo = { type: 'text', text: 'salahnya dimana2?' };
 // }
 // return client.replyMessage(event.replyToken,dosen);
function delay(detik,replyTokena){
  setTimeout(function(){
    detik++;
    console.log('Detik ke: '+ detik);
    if(status!=1){
      delay(detik,replyTokena);
    } else{
      console.log('hasil: ' + echo.text);
      return client.replyMessage(replyTokena, echo);
    }
  },1000);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
// //   //Akan mendengarkan message yang dimulai dengan tanda '!'
// //   if(message.author.equals(bot.user)) return;

// //   var baru = new Date();
// //   var tanggal = baru.getDate();
// //   var bulan = baru.getMonth();
// //   if(event.message=='')

// //   if(message.content == "Bodo!"){
// //     message.channel.send("Dewe!");
// //     message.channel.send("Tanggal : " + tanggal);
// //     message.channel.send("Bulan : " + bulan);
// //     message.channel.send("<?php echo $title;?>");
// //   }
// //   if(message.content.substring(0,1) == "!"){
// //     if(message.content.substring(1,6)=="siswa"){
// //       if(message.content.substring(7)=="muksin"){
// //         message.channel.send("goblok");
// //       }
// //     }
// //     if(message.content.substring(1,6)=="dosen"){
// //       var namaDosen = message.content.substring(7);
// //       message.channel.send(message.content.substring(7));
// //       var urlDosen = url + namaDosen;
// //         https.get(urlDosen,res => {
// //         console.log(res.headers['content-type']);
// //         if(res.headers['content-type']=='application/json; charset=UTF-8'){
// //           res.setEncoding("utf8");
// //           let body = "";
// //           res.on("data", data=>{
// //             body += data;
// //           }); 
// //           res.on("end", ()=>{
// //             body = JSON.parse(body);
// //             if(body['hasil']=="sukses"){
// //               message.channel.send("Nama Dosen: " + body['nama'] + "  Status: " + body['status']);}
// //             else{
// //               message.channel.send(body['status']);
// //               }
// //             }
// //           );
// //         } else{
// //           message.channel.send("Mohon mengulang kembali")
// // ;       }
// //       });
// //     }
// //   }
// //   // if(message.substring(0,1) == '!'){
// //   //  var args = message.substring(1).split(' ');
// //   //  var cmd = args[0];

// //   //  args = args.splice(1);
// //   //  switch(cmd){
// //   //    case 'Bodo' :
// //   //    bot.sendMessage({
// //   //      to : channelID,
// //   //      message: 'Dewe!'
// //   //    });
// //   //    break;
// //   //  }
// //   // }
// // });
// // bot.login(TOKEN);
// 'use strict';

// const line = require('@line/bot-sdk');
// const express = require('express');
// // const https = require('https');
// // const url = "https://radityo.000webhostapp.com/index.php?nama=";


// //Inisialiasi Bot Line
// const config = {
//  channelAccessToken : process.env.BOT_TOKEN;
//  channelSecret : process.env.BOT_SECRET;
// }
// const client = new line.Client(config);

// const app = express();

// app.post('/callback',line.middleware(config),(req,res)=>{
//  Promise
//  .all(req.body.events.map(handleEvent))
//  .then((result)=>res.json(result))
//  .catch((err)=>{
//    console.error(err);
//    res.status(500).end();
//  });

// });

// function handleEvent(evt){
//  if(event.type!=='message'|| event.message.type!=='text'){
//    return Promise.resolve(null);
//  }
  
//  // var baru = new Date();
//  // var tanggal = baru.getDate();
//  // var bulan = baru.getMonth();
//  // if(event.type=='message'){
//    if(event.message.text.substring(0,4)==dosen){
//      const namaDosen = event.message.substring(5);
//      const dosen = {type:'text',text: namaDosen};
//    }
//   else{
//    const dosen= {type:'text',text: 'error'};
//  }
//  return client.replyMessage(event.replyToken,dosen);
// }


// const port= process.env.PORT || 3000;
// app.listen(port,()=>{
//  console.log(`listening on ${port}`);
// });
// // // var req = http.request(options,function(res){
// // //  var msg = '';

// // //  res.setEncoding('utf8');
// // //  res.on('data',)
// // // });
// // bot.on('ready',function(){
// //   console.log("Ready");
// // //  logger.info('Connected');
// // //  logger.info('Logged in as: ');
// // //  logger.info(bot.username + ' - (' + bot.id + ')');  
// // });
// // bot.on('message',function(message){
// //   //Bot harus tau kapan mengeksekusi command