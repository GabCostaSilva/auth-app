const express = require("express");
const path = require("path");
const passport = require("passport");
const { User } = require("./models/index");
const flash = require("connect-flash");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const router = express.Router();

app.use(passport.initialize());
app.use(passport.session());
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(cookieParser("monster hommus"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    cookie: { maxAge: 60000 },
    saveUninitialized: true,
    resave: true,
    secret: "monster hommus"
  })
);
app.use(flash());
app.use(express.static(`${__dirname}/public`));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ where: { username: username } })
      .then(user => {
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      })
      .catch(err => done(err));
  })
);

router.get("/", (req, res) => res.redirect("/login"));

router.get("/user", (req, res) =>
  res.render(path.join(`${__dirname}/views/home`), req.user)
);

router.get("/login", (req, res) => {
  res.render(path.join(`${__dirname}/views/login`), {
    message: req.flash()
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/user",
    failureRedirect: "/login",
    badRequestMessage:
      "Something went wrong with our servers. Try again later.",
    failureFlash: true
  })
);

router.get("/register", (req, res) => {
  req.flash();
  res.render("register", { messages: req.flash() });
});

router.post("/register", (req, res, next) => {
  const user = req.body;

  User.create({
    username: user.username,
    password: user.password,
    email: user.email
  })
    .then(user => {
      console.log(user.username);
      req.flash("success", "Successfully registered");
      res.redirect("/");
    })
    .catch(err => {
      next(err);
    });
});

app.use("/", router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
app.listen(process.env.port || 3000);

console.log("Running at http://localhost:3000");
