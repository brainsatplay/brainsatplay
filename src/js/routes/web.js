const express = require("express");
const router = express.Router();
const auth = require("../auth");
const path = require("path");

let routes = app => {

router.get("/", (req, res, next) => {
  return res.sendFile(path.join(`${__dirname}/../public/index.html`));
});

router.post("/login", async (req,res,next) => {
  console.log(app.get('mongodb'))
  res.send(await auth.check(req.body,app.get('mongodb')))
});

  return app.use("/", router);
};

module.exports = routes;
