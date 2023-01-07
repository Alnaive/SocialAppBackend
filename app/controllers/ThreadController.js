const collection = require('../models');
const config = require("../config/auth.js");
const { authJwt } = require("../middleware");

const Thread = collection.thread;
var jwt = require("jsonwebtoken");

exports.index = async (req, res) => {
    
  };
  exports.findId = (req, res) => {
    const id = req.params.id;

    Thread.findById(id)
    .then((data) => {
        if(!data){
            res.status(404).json({
                message: `${id} not found`
            })
        } else {

            res.status(200).json(data)

        }
    }).catch((err) => {
        res.status(500).json({
            message: err.message || 'fail retrieving data id'
        })
    });
}
exports.create = (req, res) => {
    if(!req.body.content){
        res.status(400).json({
            message: 'Invalid cannot be empty content',
        })
    }
    let token = req.session.token;
  
    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }
  
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }

      const thread = new Thread({
        title: req.body.title,
        content: req.body.content,
        owner: req.userId = decoded.id,
    })

    thread.save(thread)
    .then((data) => {
        res.json(data)
    }).catch((err) => {
        res.status(500).json({
            message: err.message || "error while inserting"
        })
    });
    });
    // const userCollect = authJwt.verifyToken;
    
}
verifyToken = (req, res, next) => {
    
  };
exports.update = (req, res) => {
   
}

exports.delete = (req, res) => {
}