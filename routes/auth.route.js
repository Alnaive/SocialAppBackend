const { verifySignUp } = require("../app/middleware");
const controller = require("../app/controllers/authController");
const express = require("express");
let router = express.Router();

router.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post(
    "/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  router.post("/signin", controller.signin);
  router.post("/signout", controller.signout);
router.post("/forgot", controller.forgotPassword);
router.post("/reset/:id", controller.resetPassword);
module.exports = router;