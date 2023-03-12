module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post'
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
      },
      { timestamps: true }
    );

    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    schema.pre('save', async function(next) {
      const user = await User.findById(this.user);
      if(!user) return next(Error('User not found'));
      const post = await Post.findById(this.post);
      if(!post) return next(Error('Post not found'));
      next();
    });

    const Like = mongoose.models.like || mongoose.model("like", schema);
    return Like;
}