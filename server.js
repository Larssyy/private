require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const recordRoutes = require("./routes/record");

const app = express();
app.use(express.json());

connectDB();

app.use("/api/records", recordRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
