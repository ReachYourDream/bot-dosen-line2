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
var user = '';
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
  user = value;
  oldLog(value);
}
var cron = require('cron');

// var job1 = new cron.CronJob({
//   cronTime: '* * * * * *',
//   onTick: function() {
//     console.log('job 1 ticked');
//   },
//   start: false,
//   timeZone: 'America/Los_Angeles'
// });
// job1.start();
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
  user = '';
  client.getProfile(event.source.userId)
    .then((profile) =>{
      console.log(JSON.stringify(profile));
      // global.userId = String(profile.userId);
    }
      );
  echo = { type: 'text', text: 'Untuk sementara fitur yang bisa digunakan hanya: \n\
  dosen(spasi)nama dosen\n\
  Contoh: Dosen Rudi' };

  status=1;
  const b = String(event.message.text);
  if(b.toLowerCase().substring(0,5)=='lapor'){
    const lapor = '&fungsi=lapor';
    var split = b.split(" ");
    var stat = split[1];
    var namaDosen = b.toLowerCase().substring(b.indexOf(split[2]));
    oldLog('stat ' + stat + ' nama' +  b.indexOf(split[2]));
    if(stat != 'hadir' && stat != 'tidak'){
      echo.text = 'Status yang anda masukkan salah.\nketik "Help" untuk melihat susunan commands';
      return client.replyMessage(event.replyToken,echo);
    }
    var status = '&status=' + stat;
    if(namaDosen.length<3){
      echo.text = 'Untuk pencarian nama dosen minimal 3 karakter';
      return client.replyMessage(event.replyToken,echo);
    }
    var urlDosen = url+namaDosen+lapor+status;
    delay1(0,urlDosen,event.replyToken,namaDosen);
    // return client.replyMessage(event.replyToken, echo);


  } else if(b.toLowerCase().substring(0,5)=='dosen'){
    const namaDosen = b.substring(6).toLowerCase();
    const cek = '&fungsi=cek';
    var date = new Date();
    var date1 = date.getHours()+7;  
    // do{oldLog("log:"+user);}
    // while(user.length===0);
    oldLog('panjang awal: ' + user.length);
    
    if(date1==14){
      echo = { type: 'text', text: 'Untuk fitur pengecekan dosen tidak dapat digunakan pada jam 22:00-24:00'};
      // console.log('Hasil: ' + echo.text + ' User: ' + event.source.userId);
      // var pushi = { type: 'text', text: 'Sabar mas'};
      // client.pushMessage(event.source.userId, pushi);
      return client.replyMessage(event.replyToken, echo);
    }
    if(namaDosen.length<3){
      echo.text = 'Untuk pencarian nama dosen minimal 3 karakter';
      return client.replyMessage(event.replyToken,echo);
    }
    var urlDosen = url+namaDosen+cek;
    delay1(0,urlDosen,event.replyToken,namaDosen);
    
      // var bx= 0;
      // while(status== 0){
      //   bx = 1;
      //   console.log('dilewatin');
      // }
      // status=0;
      // return client.replyMessage(event.replyToken, echo);
  } else if(b.toLowerCase().substring(0,4)=='help'){
    echo.text = 'Bot ini memiliki 2 Fitur, cek kehadiran dan lapor kehadiran. \n'
      + 'Untuk melakukan cek kehadiran ketik: \n'
      + 'dosen(spasi)nama dosen\n'
      + 'contoh: dosen budi\n\n'
      + 'untuk melakukan pelaporan ketik: \n'
      + 'lapor(spasi)status(hadir/tidak)(spasi)nama dosen\n'
      + 'contoh: lapor tidak budi \n'
      + 'atau lapor hadir budi';
      return client.replyMessage(event.replyToken,echo);
  }
  else{

  // use reply API
  status=0;
  const random = '&fungsi=query';
  const query = '&query=' + b;
  var urlQuery = url+random+query;
  oldLog(urlQuery);
  akses_web2(urlQuery);
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
    if(detik>12){
      echo.text = "Maaf server sedang sibuk, mohon mencoba kembali";
      return client.replyMessage(replyTokena, echo);
    }
    if(status!=1){
      delay(detik,replyTokena);
    } else{
      console.log('hasil: ' + echo.text);
      return client.replyMessage(replyTokena, echo);
    }
  },1000);
}
function delay1(detiks,urlDosen,replyTokena,namaDosen){
  setTimeout(function(){
    detiks++;
    oldLog('Detik profil ke: '+ detiks + ' ' + user.length);
    if(user.length==0){
      delay(detiks,urlDosen);
    } else{
      var jsonProfile = JSON.parse(user);
      const logging = '&user=' + jsonProfile.displayName + '&userid=' + jsonProfile.userId;
      oldLog('akhirnya bisa ' + jsonProfile.displayName + ' ' + jsonProfile.displayName);
      var urlDosens = urlDosen + logging;
      oldLog(urlDosens);
      akses_web(urlDosens,replyTokena,namaDosen);
    }
  },1000);
}

function akses_web2(url){
  if(user.length==0){
      akses_web2(url);
    } else{
      var jsonProfile = JSON.parse(user);
      const logging = '&user=' + jsonProfile.displayName + '&userid=' + jsonProfile.userId;
      var urlQuery = url+logging;
      https.get(urlQuery,res => {});
}

function akses_web(urlDosens,replyTokena,namaDosen){
    // echo = { type:'text', text: 'Mohon menunggu' };
    // client.replyMessage(event.replyToken,echo);
    status = 0;
    var detik= 0;
    // return client.replyMessage(event.replyToken, echo);
    https.get(urlDosens,res => {
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
                echo.text = 'Terdapat ' + body['jumlah'] + ' dosen dengan nama \"' + namaDosen + '\" Yaitu:\n' + str +'\n\n' 
                + 'Perlengkap nama dosen untuk mendapatkan detail laporan kehadiran';
                ;
              } else{
                if(body['status'][1]=="Belum"){
                  echo.text= 'Nama Dosen: ' + body['nama'] + '\n' 
              + 'Status Filkom Apps: ' + body['status'][0] + '\n' 
              + 'Status Laporan: Belum ada laporan';
                } else{
              echo.text= 'Nama Dosen: ' + body['nama'] + '\n' 
              + 'Status Filkom Apps: ' + body['status'][0] + '\n' 
              + 'Status Laporan: ' + body['status'][1] + '\n'
              + 'Laporan terakhir: ' + body['last_edit'];}
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
      }).on('error', (e) => {
      console.error(e);
      });
      delay(detik,replyTokena);
      // console.log('Request: ' + b);
}
// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  oldLog(`listening on ${port}`);
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