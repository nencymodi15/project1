const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Import Express validatior
const { check, validationResult } = require("express-validator");

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;


// Import User Mongoose schemas
let User = require("../models/user");

// Create register route
router
  .route("/register",{layout:false})
  // Get method renders the register user page
  .get((req, res) => {
    // Render page with list of genres
    res.render("register");
  })
  .post(async (req, res) => {
    // Async validation check of form elements
    await check("name", "Name is required").notEmpty().run(req);
    await check("email", "Email is required").notEmpty().run(req);
    await check("email", "Email is invalid").isEmail().run(req);
    await check("password", "Password is required").notEmpty().run(req);
    await check("confirm_password", "Confirm password is required")
      .notEmpty()
      .run(req);
    await check(
      "confirm_password",
      "Password and confirm password do not match"
    )
      .equals(req.body.password)
      .run(req);

    // Get validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      // Create new user from mongoose model
      let newUser = new User();
      // Assign attributes based on form data
      newUser.name = req.body.name;
      newUser.email = req.body.email;

      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, async function (err, hashed_password) {
          if (err) {
            console.log(err);
          } else {
            newUser.password = hashed_password;
            // Save new user to MongoDB
            let result = await newUser.save()
            if (!result) {
              // Log error if failed
              req.flash('error', 'Could not save user');
              res.redirect("/users/register");
            } else {
              // Route to login if user created
              res.redirect("/users/login");
            }
          }
        });
      });
    } else {
      // Flash error messages
      errors.array().forEach(error => {
        req.flash('error', error.msg);
      });
  
      // Redirect back to the registration page with flash messages
      res.redirect("/users/register");
    }
  });

router
  .route("/login")
  .get((req, res) => {
    res.render("login",{layout:false, messages: req.flash('error') });
  })
  .post(async (req, res, next) => {
    // Check form elements are submitted and valid
    await check("email", "Email is required").notEmpty().run(req);
    await check("email", "Email is invalid").isEmail().run(req);
    await check("password", "Password is required").notEmpty().run(req);

    // Get validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      passport.authenticate("local", async (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          req.flash('error','Invalid email or password')
          return res.redirect("/users/login");
        }

        // Use JWT to create a token
        const token = jwt.sign(
          { sub: user.id, email: user.email },
          jwtSecret,
          { expiresIn: "1h" }
        );

        // Set the token as a cookie
        res.cookie("jwt", token, { httpOnly: true });

        // Redirect the user
        res.redirect("/movies/search-form");
      })(req, res, next);
    } else {
      // Flash error messages
      errors.array().forEach(error => {
        req.flash('error', error.msg);
      });

      // Redirect back to the login page with flash messages
      res.redirect("/users/login");
    }
  });



  router.get("/logout", function (req, res) {
    res.clearCookie("jwt"); // Clear the JWT cookie
    req.logout();
    res.redirect("/users/login");
  });


module.exports = router;
