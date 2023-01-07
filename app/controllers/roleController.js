const collection = require('../models');
const Role = collection.role;

exports.create = (req, res) => {
    if(!req.body.name){
        res.status(400).json({
            message: 'Invalid cannot be empty name',
        })
    }
    const role = new Role({
        name: req.body.name,
    })

    role.save(role)
    .then((data) => {
        res.json(data)
    }).catch((err) => {
        res.status(500).json({
            message: err.message || "error while inserting"
        })
    });
}