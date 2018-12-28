const result = require('dotenv').config()
const express = require("express");
const config = require("./server.config");
const app = express();
const bodyParser = require("body-parser");
const userHandler = require("./controller/user");
const model = require("../models")
const LinkedinStategy = require("passport-linkedin").Strategy;
const cors = require("cors");
const passport = require("passport")
const { secret } = require("../config/secrets");
const session = require("express-session");

if (result.error) {
    throw result.error
}
// Set the build folder as static documents server
app.use(express.static("build"))
require('./passport')(app)
app.use(session({ secret: secret }))
app.use(bodyParser.json())
app.use(cors());

app.get("/auth/linkedin", passport.authenticate("linkedin", { failureRedirect: '/'}))
// Set the / route
app.get("/", (req, res) => res.sendFile("build/index.html"))
app.post("/register", userHandler.register)
app.post("/login", userHandler.login)
// Initiate the server
app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
