const express = require("express");

// Import node implementation of fetch API -- we do this so our server has the power to fetch!
const fetch = require("cross-fetch");

const app = express();

// Code in this section sets up an express pipeline


const Capacities = [4552000, 3537577, 2447650, 2400000, 2041000, 2030000, 1602000];
const stations = ["Shasta", "Oroville", "Trinity Lake", "New Melones", "San Luis", "Don Pedro", "Berryessa"];
// print info about incoming HTTP request 
// for debugging
app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});

// handle async API requests and return reservoir data
app.use(express.json());
app.post("/query/WaterData", async function(req, res) {
  const month = req.body.month;
  const year = req.body.year;
  let result = await lookUpWater(month, year);
  res.json(result);
});

// No static server or /public because this server
// is only for AJAX requests

// respond to all AJAX queries with this message
app.use(function(req, res, next) {
  res.json({ msg: "No such AJAX request" })
});

// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function() {
  console.log("The static server is listening on port " + listener.address().port);
});

async function lookUpWater(month, year) {

  const start = `${year}-${month}-1`;
  const end = `${year}-${month}-1`;
  const apiUrl = `https://cdec.water.ca.gov/dynamicapp/req/JSONDataServlet?Stations=SHA,ORO,CLE,NML,SNL,DNP,BER&SensorNums=15&dur_code=M&Start=${start}&End=${end}`;

  let fetchResponse = await fetch(apiUrl);
  let waterData = await fetchResponse.json();

  let finalData = {};
  let i = 0;
  for (const j of waterData) {

    finalData[stations[i]] = {
      waterStorage: j.value,
      waterCapacity: Capacities[i]
    };
    i++;

  }

  return finalData;
}
