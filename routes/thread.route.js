const thread= require("../app/controllers/ThreadController.js");
const express = require("express");

let router = express.Router();

router.get('/', thread.index);
router.get('/:id', thread.findId);
router.post('/create', thread.create);
router.put('/update/:id', thread.update);
router.delete('/delete/:id', thread.delete);

module.exports = router;