const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "views")));
const http = require('http').createServer(app);

app.use('/channels', require('./controllers/channel.ctrlr'));

http.listen(process.env.PORT || 3000, function () {
    console.log("Http server is started. Listening on port: " + (process.env.PORT || 3000));
});
