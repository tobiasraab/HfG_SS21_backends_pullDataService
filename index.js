// import environmental variables from ./.env in production mode
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// import express
const express = require("express");
const app = express();
const port = 8080;

// import mongoDB
const { MongoClient, ObjectId } = require("mongodb");

// Database Connection URL
const url = process.env.DBURL;
const dbClient = new MongoClient(url);
// Database Name
const dbName = process.env.DBNAME;
// Database Collection Name
const dbCollection = process.env.DBCOLLECTION;

// Connect to Database
let db;
let collection;
dbClient.connect((err) => {
  if (err) {
    console.log("ERROR_MONGODB: ", err);
  } else {
    console.log("CONNECTED_MONGODB");

    db = dbClient.db(dbName);
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
  const year = req.query.year;

  let option1;
  let option2;

  if (req.query.month) {
    // options if there is a specific month
    const month = req.query.month - 1; //months start with index 0

    option1 = new Date(year, month, monthStartDay, 0, 0, 0);
    option2 = new Date(year, month, monthLastDay, 23, 59, 59);
  } else {
    // options for specific year (if there is no specific month)
    option1 = new Date(year, yearStartMonth, monthStartDay, 0, 0, 0);
    option2 = new Date(year, yearLastMonth, monthLastDay, 23, 59, 59);
  }

  collection
    // find all results between two dates
    .find({ createdAt: { $gte: option1, $lt: option2 } })
    .toArray()
    .then((dbres) => {
      // send results if there are any
      if (dbres[0]) {
        console.log("FOUND_ENTRIES_MONGODB: ", dbres);
        res.status(200).send({
          action: "get trash data",
          message: "found data",
          data: dbres,
          success: true,
        });
      }
      // send answer if there are no results
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
      console.log("ERROR_MONGODB: ", err);
    });
});

// Start Express Server
app.listen(port, () => console.log(`LISTENING_EXPRESS: ${port}`));
