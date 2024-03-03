/*
This is an ACR program written in Node.js, mostly based off Tank8's python ACR.
This program is deployable in vercel. Fork this respitory and deploy it yourself. 
Set env variables username and password to your email and password for rocketbot.
Set up a uptimerobot http head pinger every 5 or 10 or 15 min for both endpoints / and /end
This might work without uptimerobot, but the cron jobs tend to fail.

Example that is currently pinging my own account:
https://acrnode.vercel.app/


Code tested, compiled, and written by thehermit (currently impersonating [RSJ] shimobri)
*/

let express = require("express");
let axios = require("axios");
let cron = require('node-cron');
let resclock=[]
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle error globally
    if (error.response) {
      console.error("Axios error:", error.response.data);
    } else {
      console.error("Axios error:", error.message);
    }
  }
);

let app = express();

const username = process.env.username;
const password = process.env.password;

async function repeat(n) {
  try {
    let response = await auth();

    let token = response.data.token;
    console.log(response.data)
    response = await timedBonus(token);
    if(response){
      console.log(response.data);
      timestamp = new Date();
      resclock.push(n)
    }

  } catch(err){console.log('repeat error'+err); return err}
  return ;
}

async function timedBonus(token) {

  let headers = {
    authorization: "Bearer " + token,
  };
  let ops = '\x22\x7B\x7D\x22';
  let res = await axios.post(
    "https://dev-nakama.winterpixel.io/v2/rpc/collect_timed_bonus",
    ops,
    { headers: headers },
  );
  return res;
}

async function auth() {
  let payload = {
    email: username,
    password: password,
    vars: {
      client_version: "99999",
    },
  };
  let res = await axios.post(
    "https://dev-nakama.winterpixel.io/v2/account/authenticate/email?create=false",
    payload,
    {
      headers: {
        Authorization: `Basic OTAyaXViZGFmOWgyZTlocXBldzBmYjlhZWIzOTo=`,
        "Content-Type": "application/json",
      },
    },
  );
  return res;
}
app.get("/", (req, res) => {
  let time = timestamp.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles"
    })
  
  res.send("Bot status: Acitve<br>Last request: " + time+ '<br>'+`[${resclock.join(', ')}]`);
});
app.head("/", (req, res) => {
  let time = timestamp.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles"
    })

  res.send("Bot status: Acitve<br>Last request: " + time+ '<br>'+`[${resclock.join(', ')}]`);
});
app.get('/end', async (req, res)=>{
  let a = false
  let b=false
  try {
    b = await repeat(2)
  } catch(e) {
    a=e
  }
  res.send(a?a:'Completed'+'<br>'+b?b:'No errors')

})
app.head('/end', async (req, res)=>{
  let a = false
  let b=false
  try {
    b = await repeat(2)
  } catch(e) {
    a=e
  }
  res.send(a?a:'Completed'+'<br>'+b?b:'No errors')
  
})


let timestamp = "None";
cron.schedule('*/31 * * * * *', () => {
  repeat(1)
}); 
app.listen(3000)
repeat()
