const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");


const compression = require('compression');
const app = express();

app.use(cors());
/* for Angular Client (withCredentials) */
// app.use(
//   cors({
//     credentials: true,
//     origin: ["http://localhost:8081"],
//   })
// );

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(compression({
  level: 6, // set compression level to 6 (default is 6)
  threshold: 1000, // set minimum response size to compress (default is 1kb)
  memLevel: 8,
  filter: (req, res) => {
      if (req.header['x-no-compression']) {
          return false
      }
      return compression.filter(req, res)
  },
}))

app.use(
  cookieSession({
    name: "lazada-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
    sameSite: 'strict'
  })
);


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to lazada application." });
});

// routes
require("./routes/auth")(app);
require("./routes/users")(app);
require("./routes/product")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.\n`);
});

function initial() {
  Role.create({
    id: 1,
    name: "user",
  });

  Role.create({
    id: 2,
    name: "sales",
  });

  Role.create({
    id: 3,
    name: "admin",
  });

  Category.create({
    id: 1,
    image: "https://salt.tikicdn.com/ts/category/54/c0/ff/fe98a4afa2d3e5142dc8096addc4e40b.png",
    name: "Điện Thoại - Máy Tính Bảng",
    slug: "dien-thoai-may-tinh-bang",
    code: "1789",
    link: "https://tiki.vn/dien-thoai-may-tinh-bang/c1789"
  })



}

// database
const db = require("./models");
const Category = db.category;
const Role = db.role;

// force: true will drop the table if it already exists
// db.sequelize.sync();

db.sequelize.sync({force: true}).then(() => {
  console.log('Drop and Resync Database with { force: true }');
  initial();
});


// db.sequelize.sync().then(async () => {
//   const categoriesCount = await db.category.count();
//   const roles = await db.role.count();
//
//   if (categoriesCount === 0 || roles === 0) {
//       // If there are no categories, run the initial function to populate the database
//       console.log('Running initial()...');
//       initial(); // Call your initial() function here
//   } else {
//       console.log('Database has already been initialized.');
//   }
// });
