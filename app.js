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
// Articles route
app.route('/articles')
  .get(function (req, res) {
    Article.find(function (err, results) {
      res.send(!err ? results : err);
    });
  })
  .post(function (req, res) {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save(function (err) {
      res.send(!err ? "Successfully added a new article" : err);
    });
  })
  .delete(function (req, res) {
    Article.deleteMany(function (err) {
      res.send(!err ? "Successfully deleted collection" : err);
    });
  });

app.route('/articles/:articleId')
  .get(function (req, res) {
    Article.findOne({ title: req.params.articleId }, function (err, foundArticle) {
      res.send(foundArticle ? foundArticle : "No article with that Title was found.");
    });
  })
  .put(function (req, res) {
    Article.replaceOne(
      { title: req.params.articleId },
      {
        title: req.body.title,
        content: req.body.content
      }, function (err) {
        res.send(!err ? "Article has been updated" : err);
      });
  })
  .patch(function (req, res) {
    // ! Tried using some of the other Model methods, but update works best in this case because of the $set ability to pull from headers
    Article.update(
      { title: req.params.articleId },
      { $set: req.body },
      function (err) {
        res.send(!err ? "Article has been updated" : err);
      }
    );
  })
  .delete(function (req, res) {
    Article.deleteOne({ title: req.params.articleId }, function (err) {
      res.send(!err ? "Successfully deleted article" : err);
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
