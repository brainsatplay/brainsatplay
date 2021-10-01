const express = require("express")
const router = express.Router();
// import * as auth from "../../library/src/server/auth"
const path = require("path")

const routes = app => {

  app.use(express.static(`${__dirname}/../../../libraries/js/src/brainstorm/dashboard`))


router.get("/", (req, res, next) => {
  return res.sendFile(path.join(`${__dirname}/../../../libraries/js/src/brainstorm/dashboard/index.html`));
});

// router.post("/login", async (req,res,next) => {
//   res.send(await auth.check(req.body,app.get('mongodb')))
// });

  return app.use("/", router);
};

module.exports = routes