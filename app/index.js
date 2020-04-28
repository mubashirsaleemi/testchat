// Add Bootstrap CSS
require('bootstrap/dist/css/bootstrap.min.css')
// Custom style
require('../public/index.css')
// Added jQuery
require('jquery/dist/jquery.min.js')
// Added Bootstrap JS
require('bootstrap/dist/js/bootstrap.min.js')

// Added to make AJAX calls
const axios = require('axios');
// Added to create custom events 
const events = require('events');
// Added to connect to websocket via 
// browser
var io = require('socket.io-client');

// Added to make API calls to server over
// HTTP
const ChatHttp = require('./lib/ChatHttp')
// Added to make websocket calls to server
const ChatSocket = require('./lib/ChatSocket')

// A class to manage application logic
// on front end. As the site consists on 
// three to four pages no need to separate
// have multiple classes for each section.
class App {

    constructor() {
        // Creating instance of event emitter
        // to create and listen to events
        this.eventEmitter = new events.EventEmitter();
        // Create instance of Chat HTTP class
        this.chatHttp = new ChatHttp;
        // Create instance of Socket class
        // passing event emitter object so
        // don't need to return from
        // ChatSocket
        this.chatSocket = new ChatSocket(
            this.eventEmitter
        );
        // It stores the logged in
        // user details; id and username
        this.user = null;
        // It stores the current page 
        // to load restricted JS
        this.page = null;
        // It stores the socket information
        this.socket = null;
        // It stores the signup fields data
        // and DOM references
        this.signup = {
            username: '',
            password: '',
            submitREF: document.getElementById('js-signup-btn'),
            usernameREF: document.getElementById('js-signup-username'),
            passwordREF: document.getElementById('js-signup-password'),
            usernameError: document.getElementById('js-signup-username-error'),
            passwordError: document.getElementById('js-signup-password-error')
        }
        // It stores the login fields data
        // and DOM references
        this.login = {
            username: '',
            password: '',
            submitREF: document.getElementById('js-login-btn'),
            usernameREF: document.getElementById('js-login-username'),
            passwordREF: document.getElementById('js-login-password'),
            usernameError: document.getElementById('js-login-username-error'),
            passwordError: document.getElementById('js-login-password-error')
        }
        // It stores the list of users
        this.chatList = [];
        // Binding App class 'this' to these functions
        this.signupUsernameHandler = this.signupUsernameHandler.bind(this)
        this.signupPasswordHandler = this.signupPasswordHandler.bind(this)
        this.signupSubmitHandler = this.signupSubmitHandler.bind(this)
        //
        this.loginUsernameHandler = this.loginUsernameHandler.bind(this)
        this.loginPasswordHandler = this.loginPasswordHandler.bind(this)
        this.loginSubmitHandler = this.loginSubmitHandler.bind(this)
        //
        this.resetChatList = this.resetChatList.bind(this)
        //
        this.pageHandler = this.pageHandler.bind(this)
        //
        this.loadChatList = this.loadChatList.bind(this)
        //
        this.loadConversation = this.loadConversation.bind(this)
    }

    // It returns value a specific
    // time. Works similar to lodash 
    // bounce
    delay(callback, ms) {
        var timer = 0;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }

    // Signup Methods
    // Triggers upon form submission
    async signupSubmitHandler(e) {
        //
        e.preventDefault();
        //
        this.signup.usernameError.innerText = ''
        this.signup.usernameError.style.display = 'none'
        this.signup.passwordError.innerText = ''
        this.signup.passwordError.style.display = 'none'
        //
        let proceed = true;
        //
        if (this.signup.username == '') {
            this.signup.usernameError.innerText = 'This field is required'
            this.signup.usernameError.style.display = 'block'
            proceed = false;
        }
        //
        if (this.signup.password == '') {
            this.signup.passwordError.innerText = 'This field is required'
            this.signup.passwordError.style.display = 'block'
            proceed = false;
        }
        //
        if (!proceed) return;
        //
        try {
            var response = await this.chatHttp.register({ username: this.signup.username, password: this.signup.password })
            //
            if (response.error === false) {
                // Lets create session and
                await this.chatHttp.setLS('userId', response.userId)
                await this.chatHttp.setLS('username', this.signup.username)
                // redirect to login page
                window.location = '/chat'
            }
        } catch (ex) {
            alert('Something went wrong while registering.');
        }
    }
    // Triggers upon when user start 
    // typing in username field
    async signupUsernameHandler(e) {
        //
        this.signup.username = e.target.value.trim()
        //
        if (this.signup.username == '') {
            this.signup.username = ''
            this.signup.usernameError.innerText = ''
            return
        }
        // Make a call and verify username
        var response = await this.chatHttp.checkUsernameAvailability(this.signup.username)
        //
        if (response.error === true) {
            //
            this.signup.usernameError.innerHTML = '<strong>' + (this.signup.username) + '</strong> is already taken, try another username.'
            this.signup.usernameError.style.display = 'block'
            return;
        }
    }
    // Triggers upon when user start 
    // typing in password field
    signupPasswordHandler(e) {
        this.signup.password = e.target.value.trim()
    }

    // Login Methods
    //
    async loginSubmitHandler(e) {
        //
        e.preventDefault();
        //
        this.login.usernameError.innerText = ''
        this.login.usernameError.style.display = 'none'
        this.login.passwordError.innerText = ''
        this.login.passwordError.style.display = 'none'
        //
        let proceed = true;
        //
        if (this.login.username == '') {
            this.login.usernameError.innerText = 'This field is required'
            this.login.usernameError.style.display = 'block'
            proceed = false;
        }
        //
        if (this.login.password == '') {
            this.login.passwordError.innerText = 'This field is required'
            this.login.passwordError.style.display = 'block'
            proceed = false;
        }
        //
        if (!proceed) return;
        //
        try {
            var response = await axios.post('http://localhost:3030/login', { username: this.login.username, password: this.login.password })
            // var response = await this.chatHttp.login({ username: this.login.username, password: this.login.password })
            //
            if (!response.error) {
                // Lets create session and
                await this.chatHttp.setLS('userId', response.userId)
                await this.chatHttp.setLS('username', this.login.username)
                // redirect to login page
                window.location = '/chat'
            }
        } catch (ex) {
            alert('Invalid credentials!');
        }
    }
    //
    loginUsernameHandler(e) {
        this.login.username = e.target.value.trim()
    }
    //
    loginPasswordHandler(e) {
        this.login.password = e.target.value.trim()
    }

    //
    loadChatList(d) {
        if (d.error === true) {
            //
            this.chatList = []
        } else {
            this.chatList = d.chatList
        }
        this.resetChatList();
    }

    //
    resetChatList() {
        if (this.chatList == undefined || this.chatList.length === 0) {
            // Flush the view
            document.getElementById('js-chat-list-container').innerHTML = '<div class="alert alert-info">No users found.</div>';
            return;
        }
        //
        var
            rows = '',
            i = 0,
            il = this.chatList.length;
        //
        for (i; i < il; i++) {
            rows += '<li class="js-chatlist-li" data-id="' + (this.chatList[i]['id']) + '">' + (this.chatList[i]['username']) + '<span class="' + (this.chatList[i]['online'] == 'Y' ? 'online' : 'offline') + '"></span></li>';
        }
        document.getElementById('js-chat-list-container').innerHTML = rows;
        //
        var els = document.getElementsByClassName('js-chatlist-li');
        //
        i = 0;
        for (i; i < il; i++) {
            els[i].addEventListener('click', (e) => {
                this.loadConversation(e.target.getAttribute('data-id'));
            }, false)
        }
    }

    // Load Conversation
    async loadConversation(userId) {
        var e = await this.chatHttp.getMessages(this.user.id, userId);
        // TODO:
        // Load chat in conversation area
        // ChatSocketServer.eventEmitter.on('add-message-response', this.receiveSocketMessages);
    }

    //
    pageHandler() {
        switch (this.page) {
            case 'register':
            case 'login':
                this.signup.submitREF.onclick = this.signupSubmitHandler
                this.signup.usernameREF.onkeyup = this.delay(this.signupUsernameHandler, 600)
                this.signup.passwordREF.onkeyup = this.signupPasswordHandler
                //
                this.login.submitREF.onclick = this.loginSubmitHandler
                this.login.usernameREF.onkeyup = this.loginUsernameHandler
                this.login.passwordREF.onkeyup = this.loginPasswordHandler
                break;
            case 'chat':
                this.eventEmitter.on('chat-list-response', this.loadChatList)
                break;
        }
    }

    // Set the current page
    getCalledPage() {
        this.page = window.location.pathname.replace('/', '').trim().toLowerCase()
        if (this.page == '') this.page = 'index'
    }

    // Check INIT
    async init() {
        //
        this.getCalledPage();
        //
        this.pageHandler()
        // Check if user is logged in
        let response = await axios.get('http://localhost:3030/getUserId');
        // If no session is found then do nothing
        if (response.data.data == null) {
            console.log('User not logged in')
            return
        }
        this.user = response.data.data;
        // Get and Set the current URL for websocket
        this.socket = await this.chatSocket.establishSocketConnection(this.user.id);
        //
        if (this.page == 'chat') {
            await this.chatSocket.getChatList(this.user.id);
            this.pageHandler()
        }
        // handling
    }

}

// Create instance of App class
var app = new App();
// Call the initialization method
app.init();