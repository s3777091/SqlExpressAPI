const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const compression = require('compression');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression({
  level: 6,
  threshold: 1000,
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
    keys: ["COOKIE_SECRET"],
    httpOnly: true,
    sameSite: 'strict'
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Lazada application." });
});

// routes
require("./routes/auth")(app);
require("./routes/users")(app);
require("./routes/product")(app);
require("./routes/sales")(app);
require("./routes/Home")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.\n`);
});


async function initial() {
    const transaction = await db.sequelize.transaction(); // Start a transaction

    try {
        // Create roles
        await Role.bulkCreate([
            { id: 1, name: "user" },
            { id: 2, name: "admin" },
            { id: 3, name: "seller" }
        ], { transaction });

        // Create categories using bulkCreate
        await Category.bulkCreate([
            {
                image: "https://salt.tikicdn.com/ts/category/54/c0/ff/fe98a4afa2d3e5142dc8096addc4e40b.png",
                name: "Điện Thoại - Máy Tính Bảng",
                slug: "dien-thoai-may-tinh-bang",
                code: "1789",
                expectedSpace: (160.8 * 78.1 * 7.7) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/dien-thoai-may-tinh-bang/c1789"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/92/b5/c0/3ffdb7dbfafd5f8330783e1df20747f6.png",
                name: "Laptop - Máy Vi Tính - Linh kiện",
                slug: "laptop-may-vi-tinh-linh-kien",
                code: "1846",
                expectedSpace: (320.4 * 166.2 * 60.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/laptop-may-vi-tinh-linh-kien/c1846"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/00/5d/97/384ca1a678c4ee93a0886a204f47645d.png",
                name: "Thời trang nam",
                slug: "thoi-trang-nam",
                code: "915",
                expectedSpace: (420.4 * 266.2 * 20.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/thoi-trang-nam/c915"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/55/5b/80/48cbaafe144c25d5065786ecace86d38.png",
                name: "Thời trang nữ",
                slug: "thoi-trang-nu",
                code: "931",
                expectedSpace: (420.4 * 266.2 * 20.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/thoi-trang-nu/c931"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/61/d4/ea/e6ea3ffc1fcde3b6224d2bb691ea16a2.png",
                name: "Điện Gia Dụng",
                slug: "dien-gia-dung",
                code: "1882",
                expectedSpace: (1020.4 * 846.2 * 420.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/dien-gia-dung/c1882"
            },


        ], { transaction });

        // Create warehouses using bulkCreate
        await WareHouse.bulkCreate([
            {
                city: 'Hồ Chí Minh',
                district: 'Quận 7',
                province: 'Nam Phong',
                street: 'Nguyễn Thị Thập',
                totalArea: 3000,
            },
            {
                city: 'Đà nẵng',
                district: 'Hải Châu',
                province: 'Bình Hiên',
                street: 'Hoàng diệu',
                totalArea: 3000,
            },

        ], { transaction });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.log(error.message);
    }
}

// database
const db = require("./models");
const Category = db.category;
const Role = db.role;
const WareHouse = db.warehouse;

// db.sequelize.sync({force: true}).then(async () => {
//     console.log('Drop and Re-sync Database with { force: true }');
//     await initial();
// });

db.sequelize.sync().then(async () => {
  const categoriesCount = await db.category.count();
  const roles = await db.role.count();

  if (categoriesCount === 0 || roles === 0) {
      // If there are no categories, run the initial function to populate the database
      console.log('Running initial()...');
      await initial(); // Call your initial() function here
  } else {
      console.log('Database has already been initialized.');
  }
});