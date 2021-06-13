/*
 * @Description:
 * @Autor: Liou
 * @Date: 2021-06-13 20:49:20
 * @LastEditors: Liou
 * @LastEditTime: 2021-06-13 21:30:59
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
    })

    //watch login

});

server.listen(PORT, () => {
    console.log(`serve is running ${PORT} port...`);
});
