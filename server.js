const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(morgan("dev"));
const routes = require('./routes')
app.use('/bookmarks', routes)

const { init } = require('./db')

init(); // initialze the database

app.get('/', (req, res, next) => {
  res.redirect('/bookmarks')
})

app.get("*", (req, res) => { // rather than a 404, just send them to the main page
  console.log("NO MATCH - going to home")
  res.redirect("/bookmarks");
})

const PORT = 1339;

app.listen(PORT, () => {
  console.log(`App listening in port ${PORT}`);
});
