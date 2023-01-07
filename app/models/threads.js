module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
       
        title: String,
        content: {
          type: String,
          require: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
      },
      { timestamps: true }
    );

// convert default mongo _id to id
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    const Thread = mongoose.models.thread || mongoose.model("thread", schema);
    return Thread;
  };
