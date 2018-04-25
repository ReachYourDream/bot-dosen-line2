'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const https = require('https');
const http = require('http');
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
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
// create LINE SDK client
const client = new line.Client(config);
var user = '';
var namaLengkap = [];
var stats = [];
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
  namaLengkap = [];
  stats = []; 
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
    delay1(0,namaDosen,b,event.replyToken);

    // return client.replyMessage(event.replyToken, echo);


  } else if(b.toLowerCase().substring(0,5)=='dosen'){
    const namaDosen = b.substring(6).toLowerCase();
    // const cek = '&fungsi=cek';
    var date = new Date();
    var date1 = date.getHours();  
    // do{oldLog("log:"+user);}
    // while(user.length===0);
    oldLog('panjang awal: ' + user.length);
    
    if(date1==19){
      echo = { type: 'text', text: 'Untuk fitur pengecekan dosen tidak dapat digunakan pada jam 02:00-03:00'};
      // console.log('Hasil: ' + echo.text + ' User: ' + event.source.userId);
      // var pushi = { type: 'text', text: 'Sabar mas'};
      // client.pushMessage(event.source.userId, pushi);
      return client.replyMessage(event.replyToken, echo);
    }
    if(namaDosen.length<3){
      echo.text = 'Untuk pencarian nama dosen minimal 3 karakter';
      return client.replyMessage(event.replyToken,echo);
    }
    // var urlDosen = url+namaDosen+cek;
    delay1(0,namaDosen,b,event.replyToken);
    // delay1(detiks,namaDosen,b,replyTokena){
    // aksesWebStatus(namaDosen,b);
    
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
  else if(b.toLowerCase().substring(0,4)=='ciyo'){
    akses_web3();
  }
  else{

  // use reply API
  status=0;
  const random = '&fungsi=query';
  const query = '&query=' + b;
  var urlQuery = url+random+query;
  oldLog(urlQuery);
  akses_web2(urlQuery);
  akses_web3();
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
function delay1(detiks,namaDosen,b,replyTokena){
  setTimeout(function(){
    detiks+=0.5;
    oldLog('Detik profil ke: '+ detiks + ' ' + user.length);
    if(user.length==0){
      delay1(detiks,namaDosen,b,replyTokena);
    } else{
      var jsonProfile = JSON.parse(user);
      const logging = '&user=' + jsonProfile.displayName + '&userid=' + jsonProfile.userId;
      oldLog('akhirnya bisa ' + jsonProfile.displayName + ' ' + jsonProfile.displayName);
      // var urlDosens = urlDosen + logging;
      // oldLog(urlDosens);
      aksesWebStatus(jsonProfile.userId,jsonProfile.displayName,namaDosen,b,replyTokena);
      // akses_web(urlDosens,replyTokena,namaDosen);
    }
  },500);
}
function aksesWebStatus(id,username,name,b,replyTokena){
  var urlFilkom= 'http://filkom.ub.ac.id/info/hadir';
  var nama = ucwords(name);
  var iterasi = 0;
  http.get(urlFilkom, res => {
    let body = '';
          res.on('data', data=>{
            body += data;
          }); 
          res.on('end', ()=>{
            var indeks = 0;
            do{
            indeks = body.indexOf(nama,indeks);
            var awal_staff = body.indexOf('<div class="tab-pane fade" id="tstaff">');
            if(indeks>0 && indeks<awal_staff){
              iterasi++;
              var pembuka = '<span class="text text-default" style="color:#444">';
              var penutup = '</span></a></b>';
              var awal = body.indexOf(pembuka,indeks-90)+pembuka.length;
              var akhir = body.indexOf(penutup,indeks);
              namaLengkap.push(body.substring(awal,akhir));
              var pembukaStatus = "align='center'>";
              var penutupStatus = '</div>';
              var awalStatus = body.indexOf(pembukaStatus,akhir)+pembukaStatus.length;
              var akhirStatus = body.indexOf(penutupStatus,awalStatus);
              stats.push(body.substring(awalStatus,akhirStatus));
            } 
            // var pencarian = indeks;
            indeks++;
            }
            while(indeks != 0 && indeks <awal_staff);
            if(iterasi==0){
              echo.text = "Nama Dosen yang anda masukkan salah";
              return client.replyMessage(replyTokena, echo);
            }
            oldLog('nama: ' + namaLengkap + ' status: ' + status);

            // oldLog(body.indexOf('Nanang'));
          });
          res.on('error', (e) => {
            console.error(e);
          });
        });
  delayStatus(0,id,username,b,iterasi,replyTokena);
}
function delayStatus(detik,id,username,b,jumlah,replyTokena){
   setTimeout(function(){
    if(namaLengkap.length == 0){
      detik+=0.5;
      oldLog("delayStatus: " + detik);
      if(detik>50){
        oldLog('wah kebanyakan');
        return;
      }
      delayStatus(detik,id,username,b,replyTokena);
    } else if(namaLengkap.length == 1){
      try {
        var query = "SELECT sp_cek_dosen('"+ id + "','"+username +"','" 
        + b + "','" + namaLengkap[0] + "') as message;"; 
        pool.query(query,(err,result)=>{
          if(err){
            return console.error('Error executing query', err.stack);
          }
          echo.text= 'Nama Dosen: ' + namaLengkap[0] + '\n' 
              + 'Status Filkom Apps: ' + stats[0] + '\n' 
              + 'Status Laporan: ' + result.rows[0].message['status'] + '\n'
              + 'Laporan terakhir: ' + result.rows[0].message['last_edit_time'];
          oldLog("nama: " + result.rows[0].message['nama_dosen'] +  ". status: " 
            + result.rows[0].message['status'] + ". Last Edit: " 
            + result.rows[0].message['last_edit_time']);
        });
      } catch (err) {
        console.error("Error " + err);
        res.send("Error " + err);
      }
      return client.replyMessage(replyTokena,echo);
    }
    else{
      var str = '';
      var x;
      for(x = 0; x<jumlah;x++){
        str = str + (x+1) + '. ' + namaLengkap[x] + ' (' + namaLengkap[x] + ')\n';
      }
      echo.text = 'Terdapat ' + jumlah + ' dosen dengan nama \"' + namaDosen + '\" Yaitu:\n' + str +'\n\n' 
      + 'Perlengkap nama dosen untuk mendapatkan detail laporan kehadiran';
      try {
        var query = "SELECT sp_cek_dosen('"+ id + "','"+username +"','" 
        + b + "') as message;"; 
        pool.query(query,(err,result)=>{
          if(err){
            return console.error('Error executing query', err.stack);
          }
          oldLog("query: " + b);
        });
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
      return client.replyMessage(replyTokena,echo);
    }
  },500);
 }


 
 function ucwords (str) {
  //  discuss at: http://locutus.io/php/ucwords/
  // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Waldo Malqui Silva (http://waldo.malqui.info)
  // improved by: Robin
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // bugfixed by: Cetvertacov Alexandr (https://github.com/cetver)
  //    input by: James (http://www.james-bell.co.uk/)
  //   example 1: ucwords('kevin van  zonneveld')
  //   returns 1: 'Kevin Van  Zonneveld'
  //   example 2: ucwords('HELLO WORLD')
  //   returns 2: 'HELLO WORLD'
  //   example 3: ucwords('у мэри был маленький ягненок и она его очень любила')
  //   returns 3: 'У Мэри Был Маленький Ягненок И Она Его Очень Любила'
  //   example 4: ucwords('τάχιστη αλώπηξ βαφής ψημένη γη, δρασκελίζει υπέρ νωθρού κυνός')
  //   returns 4: 'Τάχιστη Αλώπηξ Βαφής Ψημένη Γη, Δρασκελίζει Υπέρ Νωθρού Κυνός'

  return (str + '')
    .replace(/^(.)|\s+(.)/g, function ($1) {
      return $1.toUpperCase()
    })
}

function delay(detik,replyTokena){
  setTimeout(function(){
    detik++;
    oldLog('Detik ke: '+ detik);
    if(detik>12){
      echo.text = "Maaf server sedang sibuk, mohon mencoba kembali";
      return client.replyMessage(replyTokena, echo);
    }
    if(status!=1){
      delay(detik,replyTokena);
    } else{
      oldLog('hasil: ' + echo.text);
      return client.replyMessage(replyTokena, echo);
    }
  },1000);
}


function akses_web2(url){
  setTimeout(function(){if(user.length==0){
      akses_web2(url);
    } else{
      var jsonProfile = JSON.parse(user);
      const logging = '&user=' + jsonProfile.displayName + '&userid=' + jsonProfile.userId;
      var urlQuery = url+logging;
      https.get(urlQuery,res => {});
    }
  },1000);
}

function akses_web(urlDosens,replyTokena,namaDosen){
    // echo = { type:'text', text: 'Mohon menunggu' };
    // client.replyMessage(event.replyToken,echo);
    status = 0;
    var detik= 0;
    // return client.replyMessage(event.replyToken, echo);
    https.get(urlDosens,res => {
        oldLog(res.headers['content-type']);
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
            oldLog(body['hasil']);
            if(body['hasil']=='sukses'){
              if(body['jumlah']>1){
                var str = '';
                var x;
                for(x = 0; x<body['jumlah'];x++){
                  str = str + (x+1) + '. ' + body['nama'][x] + ' (' + body['status'][x] + ')\n';
                }
                echo.text = 'Terdapat ' + body['jumlah'] + ' dosen dengan nama \"' + namaDosen + '\" Yaitu:\n' + str +'\n\n' 
                + 'Perlengkap nama dosen untuk mendapatkan detail laporan kehadiran';
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
            else if(body['hasil'=='error jumlah']){
              echo.text=''
            }
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
// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true
// });

// app.get('/db', async (req, res) => {
//   try {
//     const abcd = await pool.connect()
//     const result = await abcd.query("SELECT sp_cek_dosen('123','coba','dosen himawat','Himawat Aryadita, S.T, M.Sc') as message;");
//     oldLog('test'+ await result.rows[0].message['nama_dosen']);
//     // var hasil = JSON.parse(result.rows[0].message);
//     // oldLog(hasil['nama_dosen']);
//     abcd.release();
//   } catch (err) {
//     console.error(err);
//     res.send("Error " + err);
//   }
// });
