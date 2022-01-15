/* 
  Author: Tobias Raab

  Used Libraries:
  cors: 2.8.5 https://www.npmjs.com/package/cors
  express: 4.17.2 https://www.npmjs.com/package/express
  mongodb: 4.3.0 https://www.npmjs.com/package/mongodb
  dotenv: 10.0.0 https://www.npmjs.com/package/dotenv
*/


// import environmental variables from ./.env in production mode
// copy content of env.txt in a new file called .env and insert variable_values to make the program work localy
// if you deploy it on a container set your environmental variables in the configuration of the container
// environmental Variables are accessed through process.env.<VARIABLENAME>
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// import libraries
const cors = require("cors")
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");



//express server configuration
const app = express();
app.use(cors())
const port = 8080;



// Database Connection URL
const url = process.env.DBURL;
const dbClient = new MongoClient(url);
// Database Name
const dbName = process.env.DBNAME;
// Database Collection Name
const dbCollection = process.env.DBCOLLECTION;

// Connect to MongoDB database
let collection;
dbClient.connect((err) => {
  if (err) {
    console.error("ERROR_MONGODB: ", err);
  } else {
    console.log("CONNECTED_MONGODB");

    const db = dbClient.db(dbName);
    collection = db.collection(dbCollection);
  }
});

// API Endpoints
app.get("/data", (req, res) => {
  console.log("APICALL_INCOMING: ", req.query);

  // define DB search
  const monthStartDay = 0;
  const monthLastDay = 31;
  const yearStartMonth = 0;
  const yearLastMonth = 11;
  const year = req.query.year; //set year as the query.year from the incoming GET-Request

  let option1;
  let option2;

  // set parameters for database search
  if (req.query.month) {
    // search options if there is a specific month
    const month = req.query.month - 1; //months start with index 0

    option1 = new Date(year, month, monthStartDay, 0, 0, 0);
    option2 = new Date(year, month, monthLastDay, 23, 59, 59);
  } else {
    // search options for specific year (if there is no specific month)
    option1 = new Date(year, yearStartMonth, monthStartDay, 0, 0, 0);
    option2 = new Date(year, yearLastMonth, monthLastDay, 23, 59, 59);
  }

  // start database search
  collection
    .find({ createdAt: { $gte: option1, $lt: option2 } }) // find all results between two dates
    .toArray()
    .then((dbres) => {
      // send results if there are any
      if (dbres[0]) {
        console.log("FOUND_ENTRIES_MONGODB: ", dbres);
        // response to the incoming GET-Request if there are results from the database search
        res.status(200).send({
          action: "get trash data",
          message: "found data",
          data: dbres,
          success: true,
        });
      }
      // response to the incoming GET-Request if there are no results from the database search
      else {
        console.log("NO_ENTRIES_MONGODB");
        res.status(200).send({
          action: "get trash data",
          message: "No data found",
          success: false,
        });
      }
    })
    .catch((err) => {
      console.error("ERROR_MONGODB: ", err);
    });
});



// Start Express Server
app.listen(port, () => console.log(`LISTENING_EXPRESS: ${port}`));