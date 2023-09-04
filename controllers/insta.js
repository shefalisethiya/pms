const express = require("express");
const app = express.Router();
const http = require("http");
const connection = require("../db");
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);
// const io = socketIo(app);

app.post("/instacreator", async (req, res) => {
  console.log("post instacreator", req.body);
  const d1 = new Date();
  try {

    const GroupName = req.body.GroupName || null;
    const creatorName = req.body.handle || null;
    const followersCount = req.body.stats.followers_count.overall || 0;
    const followersToday = req.body.stats.followers_count.today || 0;
    const followersPast = req.body.stats.followers_count.vs_previous || 0;
    const dateCol = d1 || null;
    const followingCount = req.body.stats.following_count.overall || 0;
    const followingToday = req.body.stats.following_count.today || 0;
    const followingPast = req.body.stats.following_count.vs_previous || 0;
    const postCount = req.body.stats.post_count.overall || 0;
    const postCountToday = req.body.stats.post_count.today || 0;
    const postCountPast = req.body.stats.post_count.vs_previous || 0;

    const query = `INSERT INTO insta_creator (GroupName, creatorName, followersCount, followersToday, followersPast, dateCol, followingCount, followingToday, followingPast, postCount, postCountToday, postCountPast) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      GroupName,
      creatorName,
      followersCount,
      followersToday,
      followersPast,
      dateCol,
      followingCount,
      followingToday,
      followingPast,
      postCount,
      postCountToday,
      postCountPast
    ];

    const result = await connection.promise().query(query, values);

    const chhh = io.emit('newData', result);
    console.log('checking socket io',chhh)

    console.log("insta creator added successfully");
    res.status(200).send("insta creator added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding insta creator to database");
  }
});

app.get("/instagetcreators", (req, res) => {
  connection.query(
    `SELECT * from insta_creator`,
    (err, results, fields) => {
      if (err) {
        console.error("Error retrieving data from database: " + err.stack);
        return res
          .status(500)
          .json({ message: "Error retrieving data from database" });
      }
      return res.json(results);
    }
  );
});

app.get("/instagetposts", (req, res) => {
  connection.query(
    `SELECT * from insta_post`,
    (err, results, fields) => {
      if (err) {
        console.error("Error retrieving data from database: " + err.stack);
        return res
          .status(500)
          .json({ message: "Error retrieving data from database" });
      }
      return res.json(results);
    }
  );
});

app.post("/instapost", async (req, res) => {
  console.log("post instapost", req.body);

  try {
    // const pageId = req.params.page_id;

    const creatorName = req.body.data.creator.username || null;
    const allComments = req.body.data.comments_count.overall || 0;
    const todayComment = req.body.data.comments_count.today || 0;
    const pastComment = req.body.data.comments_count.vs_previous || 0;
    const allLike = req.body.data.likes_count.overall || 0;
    const todayLike = req.body.data.likes_count.today || 0;
    const pastLike = req.body.data.likes_count.vs_previous || 0;
    const allView = req.body.data.views_count.overall || 0;
    const todayView = req.body.data.views_count.today || 0;
    const pastView = req.body.data.views_count.vs_previous || 0;
    const title = req.body.data.title || null;
    const postedOn = req.body.data.posted_at || null;
    const postUrl = req.body.data.post_url || null;
    const postImage = req.body.data.display_url[0] || null;
    const shortCode = req.body.shortcode || null;

    const query = `INSERT INTO insta_post (creatorName, allComments, todayComment, pastComment, allLike, todayLike, pastLike, allView, todayView, pastView, title, postedOn, postUrl, postImage,shortcodes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      creatorName,
      allComments,
      todayComment,
      pastComment,
      allLike,
      todayLike,
      pastLike,
      allView,
      todayView,
      pastView,
      title,
      postedOn,
      postUrl,
      postImage,
      shortCode
    ];

    const result = await connection.promise().query(query, values);

    const chhh = io.emit('newData', result);
    console.log('checking socket io',chhh)

    console.log("insta post added successfully");
    res.status(200).send("insta post added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding insta post to database");
  }
});

module.exports = app;