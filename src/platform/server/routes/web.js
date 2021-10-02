const express = require("express")
const router = express.Router();
// import * as auth from "../../../libraries/js"
const path = require("path")

const routes = app => {


router.get("/", (req, res, next) => {
  return res.send('hello world');
});

// router.post("/login", async (req,res,next) => {
//   res.send(await auth.check(req.body,app.get('mongodb')))
// });

  return app.use("/", router);
};

module.exports = routes