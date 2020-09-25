//jshint esversion:6
// * MODULES *
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

// * GLOBAL VARIABLES *

// * APP INSTANCE *
const app = express();

// * MIDDLEWARE *
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// * CONNECTION *
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).
  catch(error => console.log(error));

// * SCHEMAS *
// articles schema and model
const articlesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const Article = mongoose.model("Article", articlesSchema);

// * ROUTES *
// Root route
app.get('/', (req, res) => {
  res.render("home", {
    content: "Nothing to see here."
  });
});

// Articles route
app.route('/articles')
  .get(function (req, res) {
    Article.find(function (err, results) {
      if (!err) {
        res.send(results);

      } else {
        res.send(err);
      }
    });
  })
  .post(function (req, res) {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save(function (err) {
      if (!err) {
        res.send("Successfully added a new article");
      } else {
        res.send(err);
      }
    });
  })
  .delete(function (req, res) {
    Article.deleteMany(function (err) {
      if (!err) {
        res.send("Successfully deleted collection");
      } else {
        res.send(err);
      }
    });
  });

app.route('/articles/:articleId')
  .get(function (req, res) {
    Article.findOne({ title: req.params.articleId }, function (err, foundArticle) {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No article with that Title was found.");
      }
    });
  });

// * SERVER *
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port " + port);
});
