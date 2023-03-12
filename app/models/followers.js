module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        followers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
          }
        ]
      },
      { timestamps: true }
    );

    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    const Follower = mongoose.models.follower || mongoose.model("follower", schema);
    return Follower;
}