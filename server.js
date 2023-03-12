const express = require("express");
const cors = require("cors");
const cron = require('node-cron');

const app = express();

var corsOptions = {
    origin : ["http://localhost:8000", "http://localhost:5173", "https://enter-mate.vercel.app"],
    allowedHeaders: ["x-access-token", "Content-Type"]
};

app.use(cors(corsOptions));

// Request object menjadi json
app.use(express.json());

app.use(express.urlencoded({ extended:true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://enter-mate.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Handle preflight requests
app.options('*', cors(corsOptions));
  

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

const Post = require('./app/models/posts.js');
// Delete soft deleted posts older than one month every day at midnight
cron.schedule('0 0 * * *', async () => {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    await Post.deleteOne({ is_deleted: true, deleted_at: { $lte: oneMonthAgo } });
  });

const userRoute = require('./routes/user.route.js');
const authRoute = require('./routes/auth.route.js');
const profileRoute = require('./routes/profile.route.js');

app.use("/api/user/", userRoute);
app.use("/api/auth/", authRoute);
app.use("/api/profile/", profileRoute);
// port
const PORT = 8000;
app.listen(PORT, (req, res) => {
    console.log(`listening on port ${PORT}`);
});
