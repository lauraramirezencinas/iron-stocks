const express = require('express');
const router = express.Router();
const axios = require("axios")
const dotenv = require("dotenv")

const key = "B0MTL1WQAB5KL5H7";
const functionName = 'SYMBOL_SEARCH';
const symbolName = 'IBM';
//const apiUrl = `https://www.alphavantage.co/query?function=${functionName}&keywords=${keywords}&apikey=${key}`;

router.post("/search-company", (req, res) => {
  console.log(req.query.company)
  let keywords = req.params.company
  let apiUrl = `https://www.alphavantage.co/query?function=${functionName}&keywords=${keywords}&apikey=${key}`;
  res.redirect("search-company")

  const getCompanyInfo =
    axios
    .get(apiUrl)
    .then(responseFromAPI => {
      console.log(responseFromAPI.data)
      // printTheChart(responseFromAPI.data); // <== call the function here where you used to console.log() the response
    })
    .catch(err => console.log('Error while getting the data: ', err));
})


module.exports = router;