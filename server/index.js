const { instrument } = require("@socket.io/admin-ui");
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io"],
        methods: ["GET", "POST"]
    }
});

const userIo = io.of("/user");
userIo.on("connection", (socket) => {
    console.log(`Connected to user namespace with username ${socket.username}`);
})

userIo.use((socket, next) => {
    if (socket.handshake.auth.token) {
        socket.username = getUsernameFromToken(socket.handshake.auth.token);
        next();
    } else {
        next(new Error("Please send token"));
    }
});

function getUsernameFromToken(token) {
    return token;
}

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User ${socket.id} joined room ${data}`)
    });

    socket.on("send_message", (data) => {
        console.log(data);
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on('ping', (number) => console.log(number));
});

instrument(io, { auth: false });

server.listen(3001, () => console.log("Server is running"));