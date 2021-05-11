import express from "express"
const router = express.Router();
// import * as auth from "../../library/src/server/auth"
import path from "path"

export const routes = app => {

router.get("/", (req, res, next) => {
  return res.sendFile(path.join(`${__dirname}/../../../public/index.html`));
});

router.post("/login", async (req,res,next) => {
  res.send(await auth.check(req.body,app.get('mongodb')))
});

  return app.use("/", router);
};

