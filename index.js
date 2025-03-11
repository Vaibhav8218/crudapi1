import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./routes/routesUser.js";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json()); // Parses JSON requests

const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL;

// Connect to MongoDB
mongoose
 .connect(MONGOURL)
  .then(() => {
    console.log("Database connected successfully.");
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => console.log("MongoDB Connection Error:", error));

// Serve Uploaded Files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes
app.use("/api/user", router);

//