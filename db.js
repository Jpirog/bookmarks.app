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

// init();

module.exports = {
  getCategoryCounts,
  getCountsByCategory,
  init,
  Bookmark
};