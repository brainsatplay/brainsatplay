const router = require("express").Router();
// import * as auth from "../../library/src/server/auth"
const path = require("path")

const routes = app => {

router.get("/", (req, res, next) => {
  return res.sendFile(path.join(`${__dirname}/../../../public/index.html`));
});

// router.post("/login", async (req,res,next) => {
//   res.send(await auth.check(req.body,app.get('mongodb')))
// });

  return app.use("/", router);
};

module.exports = routes