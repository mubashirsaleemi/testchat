const express = require('express')
const app = express()
var session = require('express-session')
var bodyParser = require('body-parser')
const ChatHttp = require('./app/lib/ChatHttp')
const chatOBJ = new ChatHttp();
// parse application/x-www-form-urlencoded
app.use(bodyParser.json())

var sess = {
    secret: 'SECRETKEYISSECRET',
    cookie: {},
    resave: true
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index', {
        user: req.session.user || null
    })
})

app.get('/about-us', function (req, res) {
    res.render('about_us', {
        user: req.session.user || null
    })
})

app.get('/login', function (req, res) {
    if (req.session.user != null) {
        res.redirect('/chat');
        return;
    }
    res.render('register', {
        activeTab: 'login',
        user: null
    })
})

app.get('/register', function (req, res) {
    if (req.session.user != null) {
        res.redirect('/chat');
        return;
    }
    res.render('register', {
        activeTab: 'register',
        user: null
    })
})

app.get('/chat', function (req, res) {
    if (req.session.user == null) {
        res.redirect('/login');
        return;
    }
    res.render('chat', {
        user: req.session.user
    })
})


app.post('/login', async (req, res) => {
    var response = await chatOBJ.login(req.body);
    //
    if (response.error === false) {
        req.session.user = { id: response.userId, username: req.body.username }
    }
    res.send(response);
    // const response = await axios.post('http://localhost:4000/login', userCredential);

})

app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/login');
});

app.get('/getUserID', (req, res) => {
    res.send({ error: true, data: req.session.user || null });
});

app.listen(3030)