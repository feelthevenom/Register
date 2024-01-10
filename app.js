const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const secure = require("dotenv");

secure.config();
const app = express();
const port = 3000;

//PASSWORD AND USERNAME
const dbUsername =process.env.USERNAME
const dbPassword =process.env.PASSWORD

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${dbUsername}:${dbPassword}@cluster0.f3kxab5.mongodb.net/?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: false, // Set to true once you confirm the SSL configuration is correct
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

// Define Mongoose schema and model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  cnfrmpassword: String
});

const User = mongoose.model('User', userSchema);

// Middleware to save user data for all incoming requests
app.use(async (req, res, next) => {
  // Check if the request has form data
  if (req.body && req.body.email && req.body.password && req.body.confirmPassword) {
    try {
      // Create a new user in the database
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        cnfrmpassword: req.body.confirmPassword, // Corrected field name
      });
      await newUser.save();
      console.log('User data is saved on the mongodb database.');
    } catch (error) {
      console.error('Error saving user data connect mongodb properly.', error);
    }
  }

  // Continue with the next middleware or route handler
  next();
});

// Define route handler for rendering the form
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define route handler for displaying posted values
app.post('/success', (req, res) => {
  try {
      res.sendFile(path.join(__dirname, 'public', 'success.html'));

      //The Stored Username and password will be Shown Here
      console.error(`Posted Email: ${req.body.email}Posted Password: ${req.body.password}Posted Confirm Password: ${req.body.confirmPassword}`);
  } catch (error) {
    console.error('Error handling POST request:', error);

  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
