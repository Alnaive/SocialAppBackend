const collection = require('../models');
const User = collection.user;
exports.index = (req, res) => {
    const username = req.query.username;
    const condition = username ? {
        username: {
            $regex: new RegExp(username), $options: 'i'
        }
    } : {}

    User.find(condition)
    .then((data) => {
        res.status(200).json(data)
    }).catch((err) => {
        res.status(500).json({
            message: err.message || 'fail retrieving data'
        })
    });
}

exports.findId = (req, res) => {
    const id = req.params.id;

    User.findById(id)
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
    if(!req.body.username){
        res.status(400).json({
            message: 'Invalid cannot be empty username',
        })
    }
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    })

    user.save(user)
    .then((data) => {
        res.json(data)
    }).catch((err) => {
        res.status(500).json({
            message: err.message || "error while inserting"
        })
    });
}

exports.update = (req, res) => {
   
}

exports.delete = (req, res) => {
}


exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
    
  };
  
  exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
  };
  
  exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
  };
  
  exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
  };