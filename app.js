if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mongoSanitize = require("express-mongo-sanitize");
// console.log(process.env.SECRET)
// console.log(process.env.API_KEY)

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const { nextTick } = require("process");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const Review = require("./models/review");
const helmet = require("helmet");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const flash = require("connect-flash");
// mongodb://localhost:27017/flotion
// const url =
//   "mongodb+srv://diagonalley:l6C1xgME5GDKFIL9@clregister.8hpdg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbUrl = "mongodb://localhost:27017/flotion";
mongoose.connect("mongodb://localhost:27017/flotion", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(mongoSanitize());

const sessionConfig = {
  name: "session",
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/yelp-camp",
    secret: "thisshouldbeabettersecret!",
    touchAfter: 24 * 60 * 60,
  }),
};

app.use(session(sessionConfig)); //used before [passport.session]

app.use(flash());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(methodOverride("_method"));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session)
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.messages = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "colt@gmail.com", username: "colt" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// const sessionConfig = {
//     secret: 'thisshouldbeabettersecret!',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7,

//     }
// }

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "OH No!, Something went wrong";
  res.status(statusCode).render("error", { err });
  // res.send("Something went wrong!")
});

app.listen(3001, () => {
  console.log("Serving on port 3000");
});
