const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("CI/CD App v1"));
app.listen(3000, () => console.log("App running"));
