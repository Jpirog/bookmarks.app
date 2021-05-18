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

init();
module.exports(init)
