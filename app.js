//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption'); 

const app = express();

app.set('view engine', 'ejs');

async function connectToDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/usersDB');
    console.log('Connected to the database');
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Call the connectToDatabase function to establish the connection
connectToDatabase();

const userSchema = new mongoose.Schema({
email: String,
password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("home.ejs");
});

app.route("/register")
    
    .get(function(req, res){
    res.render("register.ejs");
    })

    .post(function(req, res){
        try{
            const newUser = new User({
            email: req.body.username,
            password: req.body.password
            });
            newUser.save();
            res.render("secrets.ejs");
        } catch (err) {
            console.log(err);
        };
    });

app.route("/login")
    
    .get(function(req, res){
    res.render("login.ejs");
    })

    .post(function(req, res){
        try{
            const username = req.body.username;
            const password = req.body.password;
            User.findOne({email: username}).exec().then((foundUser) => {
                if (foundUser) {
                    if (foundUser.password === password) {
                        res.render("secrets.ejs");
                    } else {
                        console.log("Incorrect password");
                    };
                } else {
                    console.log("This username does not exist.")
                }
            });
        } catch (err) {
            console.log(err);
        }
    });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});