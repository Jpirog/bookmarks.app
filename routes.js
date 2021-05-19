const express = require("express");
const router = express.Router();

const morgan = require("morgan");
const html = require("html-template-tag");

router.use(morgan("dev"));
router.use(express.urlencoded({extended: false})); // needed for processing the POST
router.use(require('method-override')('_method')); // needed for DELETE method
router.use(express.static(__dirname + "/public"));
const { getCategoryCounts,
  getCountsByCategory, Bookmark} = require('./db')

const Sequelize = require('sequelize');

router.get('/', async (req, res, next) => {
  const count = await getCountsByCategory()
  const htmlhdr = html`<!DOCTYPE html><head>
  <link rel="stylesheet" href="./styles/styles.css">
  </head><body><h1>Bookmarker (${count}) </h1>`
  const hdr2 = '<h3>Add a new entry:</h3>'; 
  const hdr3 = '<hr><ul><h3>Existing Entries</h3>';
  const form = html`<form method="POST" action="/bookmarks/add">
              <input required size='40' maxlength='30' name='name' id='site' placeholder='Enter site name'>
              <input required size='40' maxlength='30' name='url' id='url' placeholder='Enter site URL'>
              <input required size='40' maxlength='30' name='category' id='category' placeholder='Enter category'>
              <input id="save" type="submit" value="Save"></form>`
  const marks = await Bookmark.findAll({
    attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('name')), 'n_count']],
    group:['category'], 
    order:[['category','ASC']]});
  const rows = marks.map(c => {
    return html`<li> <a href='/bookmarks/category/${c.dataValues.category}'>${c.dataValues.category}</a> (${c.dataValues.n_count}) </li>`}).join('')

  res.send(htmlhdr + hdr2 + form + hdr3 + rows + `</ul>
  <script>
    document.querySelector("#site").focus();
  </script>
  </body></html>`)
})

router.post('/add', async (req, res, next) => {
  const add = new Bookmark(req.body)
  await add.save();

  res.redirect(`/bookmarks/category/${req.body.category}`)
})

router.get('/category/:name', async (req, res, err) => {
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
     <form method='POST' action='/bookmarks/name/${c.dataValues.name}?_method=DELETE'>
     <input type="hidden" name="category" value="${req.params.name}">
     <button>Delete</button>
     </form>`}).join('') 

  res.send(htmlhdr + back + catHdr + '<div id="links">' + rows + '</div></body></html>')
})

router.delete('/name/:name', async (req, res, err) => {
  const del = await Bookmark.destroy({
    where: {
      name: [req.params.name]
    }
  });
  res.redirect(`/bookmarks/category/${req.body.category}`)
})

module.exports = router;