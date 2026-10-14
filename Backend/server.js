// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const connectDB = require("./src/config/database");

// const app = express();

// // Connect MongoDB
// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Test route
// app.get("/", (req, res) => {
//     res.send("AI E-Learning Backend is running");
// });

// // Server
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });


const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

const startServer = async () => {
    await connectToDB();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
});