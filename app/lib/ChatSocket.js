const axios = require('axios');

var io = require('socket.io-client');

class ChatSocket {

    constructor(eventEmitter) {
        this.socket = null
        this.eventEmitter = eventEmitter;
    }


    // Connecting to Socket Server
    async establishSocketConnection(userId) {
        try {
            this.socket = io(`http://localhost:4000`, {
                query: `userId=${userId}`
            });
            return this.socket;
        } catch (error) {
            console.log(`Something went wrong; Can't connect to socket server`);
        }
    }

    async getChatList(userId) {
        this.socket.emit('chat-list', {
            userId: userId
        });
        console.log(userId);
        this.socket.on('chat-list-response', (data) => {
            console.log(data);
            this.eventEmitter.emit('chat-list-response', data);
        });
    }

    async sendMessage(message) {
        this.socket.emit('add-message', message);
    }

    async receiveMessage() {
        this.socket.on('add-message-response', (data) => {
            this.eventEmitter.emit('add-message-response', data);
        });
    }

    async logout(userId) {
        this.socket.emit('logout', userId);
        this.socket.on('logout-response', (data) => {
            this.eventEmitter.emit('logout-response', data);
        });
    }

}

module.exports = ChatSocket;