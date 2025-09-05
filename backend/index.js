const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const pdfRoutes = require("./routes/pdf");
const highlightRoutes = require("./routes/highlight");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/highlight", highlightRoutes);

async function main() {
  await mongoose.connect(process.env.MONGODB_URL)
  
  console.log("MongoDB connected");

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(" server running perfectly");
  });
}

main();
