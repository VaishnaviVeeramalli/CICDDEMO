const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const User = require('./models/User'); 
const session = require('express-session');
const multer = require('multer');
const path = require('path'); 
const { error } = require("console");
var ObjectId = require('mongodb').ObjectId; 
var Publishable_Key = 'your key'
var Secret_Key = 'your key'
 
const stripe = require('stripe')(Secret_Key)

const app = express();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files to the 'uploads' directory
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filenames
    },
  });
  
const upload = multer({ storage });

app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
    })
  );
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(express.json())



mongoose.connect("mongodb+srv://balajipulugujju23:cUFLLg6LrvetNoAg@da1.a6dh7iw.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser : true, useUnifiedTopology : true});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/signup', (req, res) => {
    const errorMessage = '';
    const showErrorMessage = false;

    res.render('signup', { errorMessage, showErrorMessage });
});

app.post('/signup', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%^&*])[A-Za-z\d@#$!%^&*]{8,}$/;

    if (!password.match(passwordPattern)) {
        const errorMessage = 'Password does not meet the strength requirements';
        const showErrorMessage = true;
        return res.render('signup', { errorMessage, showErrorMessage });
    }

    if (password !== confirmPassword) {
        const errorMessage = 'Passwords do not match';
        const showErrorMessage = true;
        return res.render('signup', { errorMessage, showErrorMessage });
    }

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            const errorMessage = 'User with Username already Exists';
            const showErrorMessage = true;
            return res.render('signup', { errorMessage, showErrorMessage });
        }

        const newUser = new User({
            username,
            password: password,
        });

        await newUser.save();

        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/login', (req, res) => {
    const errorMessage = '';
    const showErrorMessage = false;

    res.render('login', { errorMessage, showErrorMessage });
});

app.post('/login', async (req, res) => { 

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) { 
            const errorMessage = 'Invalid username or password';
            const showErrorMessage = true;
            return res.render('login', { errorMessage, showErrorMessage });
        }
        const passwordMatch = await user.comparePassword(password);
        if (!passwordMatch) {
            const errorMessage = 'Invalid username or password';
            const showErrorMessage = true;
            return res.render('login', { errorMessage, showErrorMessage });
        }
        if(username === "admin") {
            req.session.isAdmin = true;
            return res.redirect('/admin-home');

        }
        else {
            req.session.isUser = true;
            req.session.userId = user._id;
            return res.redirect('/user-home');
        }
        
        
        
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/user-home', async(req, res) =>{
    if (req.session.isUser) {
        const events = await Event.find();
        res.render('user-home',{events, showSuccessMessage: false, showErrorMessage: false});
    } else {
        const errorMessage = 'No User Logged in';
        const showErrorMessage = true;
        return res.render('login', { errorMessage, showErrorMessage });
    }
});

app.post('/addtodo', async function(req, res) { 
  if(req.session.isUser) {
    try {        
        const userId = req.session.userId

        const event = await Event.findOne({ _id: eventId });
        const frontSeatBooked = event.frontSeats.booked; 
        const middleSeatBooked = event.middleSeats.booked; 
        const backSeatBooked = event.backSeats.booked;  
        if(frontBooking > event.frontSeats.quantity-event.frontSeats.booked 
          || middleBooking > event.middleSeats.quantity - event.middleSeats.booked
          || backBooking > event.backSeats.quantity - event.backSeats.booked) {
            throw error("Invalid Quantity")
          }
        event.frontSeats.booked = frontSeatBooked + frontBooking; 
        event.middleSeats.booked = middleSeatBooked + middleBooking; 
        event.backSeats.booked = backSeatBooked + backBooking; 

        const charge = await stripe.charges.create({
          amount: amount,
          source: stripeTokenId,
          currency: 'usd'
        }); 

        const updatedEvent = await event.save();
        console.log(updatedEvent)
        const ticket = new Ticket({
            userId,
            eventId,
            frontSeats: {
              booked: frontBooking
            },
            middleSeats: {
              booked: middleBooking,
            },
            backSeats: {
              booked: backBooking,
            },
          });
        await ticket.save();
        console.log('Charge Successful');
        res.json({ message: 'Successfully purchased items' })
      } catch (error) { 
        console.error('Charge Fail:', error);
        res.json({ message: 'unsuccesful' })
      } 
    } else {
      const errorMessage = 'No User Logged in';
      const showErrorMessage = true;
      return res.render('login', { errorMessage, showErrorMessage });
  }
})

app.get('/logout', (req, res) =>{
    if(req.session.isAdmin) req.session.isAdmin = false; 
    else req.session.isUser = false; 
    return res.redirect("/")
});

app.listen(3000, function(){
    console.log("server started working on port 3000");
});
