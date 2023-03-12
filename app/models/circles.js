module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: {
            type: String,
            required: true,
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        roleCircle: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User'
            },
            roles: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Role'
            }],
          }]
      },
      { timestamps: true }
    );

// convert default mongo _id to id
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    const Circle = mongoose.models.circle || mongoose.model("circle", schema);
    return Circle;
  };
