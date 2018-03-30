// 'use strict';

// const line = require('@line/bot-sdk');
// const express = require('express');

// // create LINE SDK config from env variables
// const config = {
//   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
//   channelSecret: process.env.CHANNEL_SECRET,
// };

// // create LINE SDK client
// const client = new line.Client(config);

// // create Express app
// // about Express itself: https://expressjs.com/
// const app = express();

// // register a webhook handler with middleware
// // about the middleware, please refer to doc
// app.post('/callback', line.middleware(config), (req, res) => {
//   Promise
//     .all(req.body.events.map(handleEvent))
//     .then((result) => res.json(result))
//     .catch((err) => {
//       console.error(err);
//       res.status(500).end();
//     });
// });

// // event handler
// function handleEvent(event) {
//   if (event.type !== 'message' || event.message.type !== 'text') {
//     // ignore non-text-message event
//     return Promise.resolve(null);
//   }

//   // create a echoing text message
//   const echo = { type: 'text', text: event.message.text };

//   // use reply API
//   return client.replyMessage(event.replyToken, echo);
// }

// // listen on port
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`listening on ${port}`);
// });
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
'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const https = require('https');
const url = "https://radityo.000webhostapp.com/index.php?nama=";


//Inisialiasi Bot Line
const config = {
	channelAccessToken : process.env.BOT_TOKEN;
	channelSecret : process.env.BOT_SECRET;
}
const client = new line.Client(config);

const app = express();

app.post('/callback',line.middleware(config),(req,res)=>{
	Promise
	.all(req.body.events.map(handleEvent))
	.then((result)=>res.json(result))
	.catch((err)=>{
		console.error(err);
		res.status(500).end();
	});

});

function handleEvent(evt){
	if(event.type!=='message'|| event.message.type!=='text'){
		return Promise.resolve(null);
	}
	
	// var baru = new Date();
	// var tanggal = baru.getDate();
	// var bulan = baru.getMonth();
	// if(event.type=='message'){
		if(event.message.text.substring(0,4)==dosen){
			const namaDosen = event.message.substring(5);
			const dosen = {type:'text',text: namaDosen};
		}
	 else{
		const dosen= {type:'text',text: 'error'};
	}
	return client.replyMessage(event.replyToken,dosen);
}


const port= process.env.PORT || 3000;
app.listen(port,()=>{
	console.log(`listening on ${port}`);
});
// // var req = http.request(options,function(res){
// // 	var msg = '';

// // 	res.setEncoding('utf8');
// // 	res.on('data',)
// // });
// bot.on('ready',function(){
// 	console.log("Ready");
// // 	logger.info('Connected');
// // 	logger.info('Logged in as: ');
// // 	logger.info(bot.username + ' - (' + bot.id + ')');	
// });
// bot.on('message',function(message){
// 	//Bot harus tau kapan mengeksekusi command