let express = require("express");
let axios = require("axios");
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

async function repeat() {
  try {
    let response = await auth();

    let token = response.data.token;
    console.log(response.data)
    response = await timedBonus(token);
    if(response){
      console.log(response.data);
      timestamp = new Date();
    }
    
  } catch(err){console.log(err)}
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
  res.send("Bot status: Acitve<br>Last request: " + timestamp);
});

let timestamp = "None";
setInterval(repeat, 1801000);
app.listen(3000)
repeat()
