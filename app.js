// Load environment variables from .env file during development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Import express
const express = require("express");

const path = require("path");
// Import mongoose
const mongoose = require("mongoose");
// Import passport library
const passport = require("passport");
// Import session
const session = require("express-session");

const flash = require('express-flash');

// Import CORS
const cors = require('cors')
const exphbs = require('express-handlebars');

const moment = require('moment');

// Import the Database module (db.js)
const db = require("./movieDB");

// Import movie routes
const movie_routes = require("./routes/movies");

// Import user routes
const user_routes = require("./routes/users");


// Initialize Express app
const app = express();

//MongoDB config
const database = require('./config/database');

// Connect to MongoDB and initialize the Movie model
try {
    // Connect to MongoDB and initialize the Movie model
    db.initialize(database.url);
} catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1); // Exit the application on database connection failure
}

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Initialize session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {},
}));

// Passport config
require("./config/passport")(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS on all routes
app.use(cors())

app.use(flash());


// Set up Handlebars as the view engine
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    formatDate: function (date, format) {
      return moment(date).format(format);
    }
  }
}));
app.set('view engine', 'hbs');


app.use("/movies", movie_routes);
app.use("/users", user_routes);


app.get('/',(req,res) => {
  res.render('index.hbs')
})
// Set constant for port
const PORT = process.env.PORT;

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
