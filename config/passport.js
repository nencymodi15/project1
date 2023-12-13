// Import passport-local, bcrypt and user schema
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwtSecret = process.env.JWT_SECRET;

module.exports = function (passport) {
  // Local Strategy
  passport.use(
    // Create local strategy with email as username
    new LocalStrategy({ usernameField: "email" }, async function (
      email,
      password,
      done
    ) {
      // Use email to query user
      let query = { email: email };
      let user = await User.findOne(query)
      // If user is not found
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      // Verify hashed password
      bcrypt.compare(password, user.password, function (err, isMatch) {
        if (err) {
          console.log(err);
        }
        // If hashed passwords match
        if (isMatch) {
          // Login succeeded
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid credentials" });
        }
      });
    })
  );

  // Determines which data is saved in the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

// User object attached to request under req.user
passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then(user => {
      // Handle user found
      done(null, user);
    })
    .catch(err => {
      // Handle error
      done(err, false, { error: err });
    });
});
};


// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    },
    function (jwt_payload, done) {
      User.findById(jwt_payload.sub)
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch((err) => {
          return done(err, false);
        });
    }
  )
);
