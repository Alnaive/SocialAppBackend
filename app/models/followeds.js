module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        following: [
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

    const Followed = mongoose.models.followed || mongoose.model("followed", schema);
    return Followed;
}