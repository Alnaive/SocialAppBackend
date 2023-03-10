    
    const user = require("../app/controllers/userController.js");
    const role = require("../app/controllers/roleController.js");
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
    
      router.get("/all", user.allAccess);
    
      router.get("/user", [authJwt.verifyToken], user.userBoard);
    
      router.get(
        "/mod",
        [authJwt.verifyToken, authJwt.isModerator],
        user.moderatorBoard
      );
    
      router.get(
        "/admin",
        [authJwt.verifyToken, authJwt.isAdmin],
        user.adminBoard
      );
    router.get('/', [authJwt.verifyToken], user.index);
    router.get('/find', user.findUser);
    router.get('/profile/:username', user.showUser);
    router.get('/authUser', user.authUser);
    router.post('/add/role', role.create);
    router.put('/updateProfile/:id', [authJwt.verifyToken], user.updateUser);
    router.put('/updatePassword/:id', [authJwt.verifyToken], user.updatePassword);
    router.delete('/delete/:id', user.delete);

    router.post('/sendVerify', user.sendEmailVerification);
    router.post('/verify/:id', user.verifyEmail);

    module.exports = router;
    // app.use('/api/user', router);
 