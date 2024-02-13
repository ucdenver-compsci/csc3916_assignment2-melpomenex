/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/movies')
    .get((req, res) => {
        // GET does not require authentication
        var o = {
            status: 200,
            message: "GET movies",
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        };
        res.status(200).json(o);
    })
    .post(authJwtController.isAuthenticated, (req, res) => {
        // POST requires JWT authentication
        var o = {
            status: 200,
            message: "movie saved",
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        };
        res.status(200).json(o);
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        // PUT requires JWT authentication
        var o = {
            status: 200,
            message: "movie updated",
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        };
        res.status(200).json(o);
    })
    .delete(authController.isAuthenticated, (req, res) => {
        // DELETE requires Basic authentication
        var o = {
            status: 200,
            message: "movie deleted",
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        };
        res.status(200).json(o);
    });
    
app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


