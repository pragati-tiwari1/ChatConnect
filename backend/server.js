// if (process.env.NODE_ENV != "production") {
//   require("dotenv").config();
// }
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

const { chats } = require("./data/data");

const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { notFound, errorHandler } = require("./data/errorMiddleware");
const { registerUser, authUser } = require("./controllers/userControllers");

const app = express();

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json()); //means to tell server that it have take data from frontend or TO ACCEPT JSON DATA

// app.get("/", (req, res) => {
//   res.send("running");
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "../frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler);

const server = app.listen(5000, () => {
  console.log("listening");
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    //here frontend will send some data and will join our room and that room will be exclusive for each user which is logged in;
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    //it helps to join with user we are going to chat
    socket.join(room);
    console.log("user joined room" + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  //for sending new messages
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    //if in a room(group,chat),there are 5 people and we are sending message so except us it should be seen by everyone other

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      console.log(newMessageReceived);
      socket.to(user._id).emit("message received", newMessageReceived);
    });
  });
  // socket.off("setup", () => {
  //   console.log("disconnected");
  //   socket.leave(userData._id);
  // });
});
