const express = require("express");
const morgan = require("morgan");
// const db = require('sequelize')
const app = express();

app.use(morgan("dev"));

const data = [
  {
    name: 'LinkedIn',
    URL: 'http://www.linkedin.com',
    category: 'jobs'
  },
  {
    name: 'Indeed',
    URL: 'http://www.indeed.com',
    category: 'jobs'
  },
  {
    name: 'Amazon',
    URL: 'http://www.amazon.com',
    category: 'shopping'
  },
  {
    name: 'W3C Shools - Javascript',
    URL: 'https://www.w3schools.com/jsref/default.asp',
    category: 'coding'
  },
  {
    name: 'Target',
    URL: 'http://www.shopping.com',
    category: 'shopping'
  },
  {
    name: 'The Weeknd',
    URL: 'https://www.theweeknd.com/',
    category: 'music'
  },
  {
    name: 'Stack Overflow',
    URL: 'https://stackoverflow.com/',
    category: 'coding'
  },
];

const Sequelize = require('sequelize');
const {STRING} = Sequelize;

const db = new Sequelize('bookmarks', 'postgres', 'FSA123', {
  host:'localhost',
  post:'5432',
  dialect: 'postgres',
  logging: false
})

const Bookmark = db.define('bookmark', {
  name: {
    type: STRING,
    allowNull: false
  },
  URL: {
    type: STRING,
    allowNull: false
  },
  category: {
    type: STRING,
    allowNull: false
  }
});
 
async function popData () {
  await data.forEach (c => Bookmark.create(c));
}

const syncAndSeed = async()=> {
  await db.sync({force:true});

//  await data.forEach(c => Bookmark.create(c));
  await popData();

  const xx = await Bookmark.findAll();

  console.log(xx);
}

const init = async() => {
  await db.authenticate();
  await syncAndSeed();
}
// const init = async() => {
//   await db.authenticate();
//   await syncAndSeed();
// }

init();

app.get('/bookmarks', async (req, res, next) => {
  let html = "<html><body><h1>Bookmarks!</h1>"
  let form = `<form action="/add"><ul><input id='site' placeholder='Enter site name'><br>
              <input id='url' placeholder='Enter site URL'><br>
              <input id='category' placeholder='Enter category'><br>
              <input type="submit" value="Submit"></form>`
  const marks = await Bookmark.findAll();
  const cats = marks.reduce((fin, c) => {
    const key = c.dataValues.category;
      if (fin.hasOwnProperty(key)) {
        fin[c.dataValues.category] += 1;
    } else {
      fin[c.dataValues.category] = 1;
    }
    return fin;
  }, {});

  console.log("FINAL", cats);

  const rows = Object.entries(cats).map(c => {
    return `<p> ${c[0]} (${c[1]}) </p>`}).join('')

  res.send(html + form + rows + "</body></html>")
})
app.get("*", (req, res) => { // rather than a 404, just send them to the main page
  res.redirect("/bookmarks");
})

const PORT = 1339;

app.listen(PORT, () => {
  console.log(`App listening in port ${PORT}`);
});
