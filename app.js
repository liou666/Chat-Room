/*
 * @Description:
 * @Autor: Liou
 * @Date: 2021-06-13 20:49:20
 * @LastEditors: Liou
 * @LastEditTime: 2021-06-14 02:34:04
 */
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server);

const PORT = 3000;

app.use(express.static(__dirname + '/public'))

const users = [];


io.on('connection', socket => {
    console.log("a user enterd!", socket.id);

    //watch client left
    socket.on("disconnect", () => {
        console.log("a user left!");
        users.splice(users.findIndex(x => x.id === socket.id), 1)
    })

    //watch login
    socket.on("login", data => {
        users.push({ ...data, id: socket.id });
        notify(`${data.nickName} enter`);
        socket.emit("saveUser", { ...data, id: socket.id })
        io.emit("renderAvater", users)
    })

    socket.on('broadMessage', data => {
        io.emit("broadMessage", data)
    })

    function notify(msg) {
        io.emit("notify", msg)
    }

});


server.listen(PORT, () => {
    console.log(`serve is running ${PORT} port...`);
});
