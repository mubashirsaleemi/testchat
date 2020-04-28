// Get express instance
const express = require('express')
// Create express server
const app = express()
// Get sessios instance
const session = require('express-session')
// Get body parser instance
const bodyParser = require('body-parser')
// Get chat http instance as we are
// managing sessions on server side
const ChatHttp = require('./app/lib/ChatHttp')
// Create an instance of chathttp class
const chatOBJ = new ChatHttp();
// Add middleware to parse incoming
// json
app.use(bodyParser.json())
// Create a session object to pass
// to session function
const sess = {
    secret: 'SECRETKEYISSECRET',
    cookie: {},
    resave: true
}
// If on production use secure sessions
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
// Use session middleware
app.use(session(sess))
// Set EJS as templating engine
app.set('view engine', 'ejs');
// Set directory for static files
// css, images, js ...
app.use(express.static('public'));

// Routes
// It's a small application so no need
// to complex things by separting routes
// file

// Loads hompage
app.get('/', function (req, res) {
    // Render the page and pass user session
    res.render('index', {
        user: req.session.user || null
    })
})

// Loads about us page
app.get('/about-us', function (req, res) {
    // Render the page and pass user session
    res.render('about_us', {
        user: req.session.user || null
    })
})

// Loads login page
app.get('/login', function (req, res) {
    // If user is logged in don't let to
    // visit login page
    if (req.session.user != null) {
        res.redirect('/chat');
        return;
    }
    // Render the page and pass user session
    res.render('register', {
        activeTab: 'login',
        user: null
    })
})

// Loads register page
app.get('/register', function (req, res) {
    // If user is logged in don't let to
    // visit login page
    if (req.session.user != null) {
        res.redirect('/chat');
        return;
    }
    // Render the page and pass user session
    res.render('register', {
        activeTab: 'register',
        user: null
    })
})

// Load chat page
app.get('/chat', function (req, res) {
    // If user is logged in don't let to
    // visit login page
    if (req.session.user == null) {
        res.redirect('/login');
        return;
    }
    // Render the page and pass user session
    res.render('chat', {
        user: req.session.user
    })
})

// Logouts user session
app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/login');
});

// Get user session details
app.get('/getUserID', (req, res) => {
    res.send({ error: true, data: req.session.user || null });
});

// Verify user credentials and 
// create login session
app.post('/login', async (req, res) => {
    // Verify creds
    var response = await chatOBJ.login(req.body);
    // Upon verification
    if (response.error === false) {
        // Sset the use session
        req.session.user = { id: response.userId, username: req.body.username }
    }
    // Send back the response as it 
    // was a AJAX call
    res.send(response);
})

// Run the server on port 3030
app.listen(3030)