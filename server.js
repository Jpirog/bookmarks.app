const express = require("express");
const morgan = require("morgan");
const html = require("html-template-tag");

const app = express();
app.use(morgan("dev"));
app.use(express.urlencoded({extended: false})); // needed for processing the POST
app.use(require('method-override')('_method')); // needed for DELETE method
app.use(express.static(__dirname + "/public"));

const data = [
  {
    name: 'LinkedIn',
    url: 'http://www.linkedin.com',
    category: 'jobs'
  },
  {
    name: 'Indeed',
    url: 'http://www.indeed.com',
    category: 'jobs'
  },
  {
    name: 'Amazon',
    url: 'http://www.amazon.com',
    category: 'shopping'
  },
  {
    name: 'W3C Shools - Javascript',
    url: 'https://www.w3schools.com/jsref/default.asp',
    category: 'coding'
  },
  {
    name: 'Target',
    url: 'http://www.shopping.com',
    category: 'shopping'
  },
  {
    name: 'The Weeknd',
    url: 'https://www.theweeknd.com/',
    category: 'music'
  },
  {
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    category: 'coding'
  },
];

const Sequelize = require('sequelize');
const {STRING} = Sequelize;

const db = new Sequelize('bookmarks', 'postgres', 'FSA123', {
  host:'localhost',
  post:'5432',
  dialect: 'postgres',
  logging: false,
  autocommit: true
})

const Bookmark = db.define('bookmark', {
  name: {
    type: STRING,
    allowNull: false
  },
  url: {
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

async function getCountsByCategory() {
  await Bookmark.findAll(); // bug - without this, the next line returns 0
  const yy = await Bookmark.count();
  return yy;
}

async function getCategoryCounts(cat) {
  const yy = await Bookmark.count({
    where: { category: cat}
  }
  );
  return yy;
}

const syncAndSeed = async()=> {
  await db.sync({force:true});

  await popData();
}

const init = async() => {
  await db.authenticate();
  await syncAndSeed();
}

init();

app.get('/bookmarks', async (req, res, next) => {
  const count = await getCountsByCategory()
  const htmlhdr = html`<!DOCTYPE html><head>
  <link rel="stylesheet" href="./styles/styles.css">
  </head><body><h1>Bookmarker (${count}) </h1>`
  const hdr2 = '<h3>Add a new entry:</h3>'; 
  const hdr3 = '<hr><ul><h3>Existing Entries</h3>';
  const form = html`<form method="POST" action="/add">
              <input required size='40' maxlength='30' name='name' id='site' placeholder='Enter site name'>
              <input required size='40' maxlength='30' name='url' id='url' placeholder='Enter site URL'>
              <input required size='40' maxlength='30' name='category' id='category' placeholder='Enter category'>
              <input id="save" type="submit" value="Save"></form>`
  const marks = await Bookmark.findAll({
    attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('name')), 'n_count']],
    group:['category'], 
    order:[['category','ASC']]});
  const rows = marks.map(c => {
    return html`<li> <a href='/category/${c.dataValues.category}'>${c.dataValues.category}</a> (${c.dataValues.n_count}) </li>`}).join('')

  res.send(htmlhdr + hdr2 + form + hdr3 + rows + `</ul>
  <script>
    document.querySelector("#site").focus();
  </script>
  </body></html>`)
})

app.post('/add', async (req, res, next) => {
  const add = new Bookmark(req.body)
  await add.save();

  res.redirect(`/category/${req.body.category}`)
})

app.get('/category/:name', async (req, res, err) => {
  const host = req.headers.host;
  const count = await getCountsByCategory();
  const htmlhdr = html`<!DOCTYPE html><head>
  <link rel="stylesheet" href="../styles/styles.css">
  </head><body><h1>Bookmarker (${count}) </h1>`;
  const back = `<h2><a href='http://${host}'>Back to main list</a></h1>`;
  
  const catCt = await getCategoryCounts(req.params.name);
  const catHdr = html`<h3>${req.params.name} (${catCt})</h3>`;
  const list = await Bookmark.findAll( {
    attributes: ['name', 'url'],
    where: {category: req.params.name},
    order:[['name','ASC']]}); 
  const rows = list.map(c => {
    return html`<a target='_blank' href='${c.dataValues.url}'>${c.dataValues.name}</a>
     <form method='POST' action='/name/${c.dataValues.name}?_method=DELETE'>
     <input type="hidden" name="category" value="${req.params.name}">
     <button>Delete</button>
     </form>`}).join('') 

  res.send(htmlhdr + back + catHdr + '<div id="links">' + rows + '</div></body></html>')
})

app.delete('/name/:name', async (req, res, err) => {
  const del = await Bookmark.destroy({
    where: {
      name: [req.params.name]
    }
  });
  res.redirect(`/category/${req.body.category}`)
})

app.get("*", (req, res) => { // rather than a 404, just send them to the main page
  console.log("NO MATCH - going to home")
  res.redirect("/bookmarks");
})

const PORT = 1339;

app.listen(PORT, () => {
  console.log(`App listening in port ${PORT}`);
});
