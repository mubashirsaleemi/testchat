const axios = require('axios');

class ChatHttp {

    getUserId() {
        return new Promise((resolve, reject) => {
            try {
                resolve(localStorage.getItem('userId'));
            } catch (error) {
                reject(error);
            }
        });
    }

    removeLS() {
        return new Promise((resolve, reject) => {
            try {
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    setLS(key, value) {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(key, value);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    login(userCredential) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('http://localhost:4000/login', userCredential);

                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

    checkUsernameAvailability(username) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('http://localhost:4000/usernameAvailable', {
                    username: username
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

    register(userCredential) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('http://localhost:4000/register', userCredential);
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

    userSessionCheck(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('http://localhost:4000/userSessionCheck', {
                    userId: userId
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

    getMessages(userId, toUserId) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('http://localhost:4000/getMessages', {
                    userId: userId,
                    toUserId: toUserId
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

}


module.exports = ChatHttp;