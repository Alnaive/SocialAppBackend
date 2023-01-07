const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const app = express();

var corsOptions = {
    origin : "http://localhost:8000"
};

app.use(cors(corsOptions));

// Request object menjadi json
app.use(express.json());

app.use(express.urlencoded({ extended:true }));

app.use(
    cookieSession({
      name: "entermate-session",
      secret: "adsd123asf235454oijdlkf", // should use as secret environment variable
      httpOnly: true
    })
  );

const db = require("./app/models/index.js");
const Role = db.role;

db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((result) => {
        console.log("Connected to Database!")
    }).catch((err) => {
        console.log("Failed to Connect into Database", err);
        process.exit();
    });
// route
app.get("/", (req,res) => {
    res.json({message: "hello word"});
});

const userRoute = require('./routes/user.route.js');
const authRoute = require('./routes/auth.route.js');
const threadRoute = require('./routes/thread.route.js');

app.use("/api/user/", userRoute);
app.use("/api/auth/", authRoute);
app.use("/api/thread/", threadRoute);
// port
const PORT = 8000;
app.listen(PORT, (req, res) => {
    console.log(`listening on port ${PORT}`);
});
