    
    const profile = require("../app/controllers/profileController.js");
    const { authJwt } = require("../app/middleware");

    const express = require("express");

    let router = express.Router();
    router.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
      });
    router.get('/user/:ownerId', profile.showProfile);
    router.get('/about/user/:ownerId', profile.showAbout);
    
    router.put('/update/:ownerId', [authJwt.verifyToken], profile.updateProfile);
    router.post('/about/store/:ownerId', [authJwt.verifyToken], profile.storeAbout);
    router.put('/about/update/:ownerId', [authJwt.verifyToken], profile.updateAbout);
    module.exports = router;
 