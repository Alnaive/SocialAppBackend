module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
       
        title: String,
        description: {
          type: String,
          require: true
        },
        date:{ 
          type: Date,
          default: Date.now 
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        chainedPost: {
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'  
            },
            description: [{
              type: String,
            }],
            default: false,
        },
        comments: [{
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          text: String,
          date: {
            type: Date,
            default: Date.now
          },
          deleted: {
            type: Boolean,
            default: false,
          },
          commentLikes: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User'
            },
            date: {
              type: Date,
              default: Date.now
            }
          }],
          reply: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User'
            },
            text: String,
            date: {
              type: Date,
              default: Date.now
            },
            deleted: {
              type: Boolean,
              default: false,
            },
            replyLikes: [{
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
              },
              date: {
                type: Date,
                default: Date.now
              }
            }],
          }]
        }],
        is_deleted: {
          type: Boolean,
          default: false,
        },
        deleted_at: {
          type: Date,
          default: null,
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

    const Post = mongoose.models.post || mongoose.model("post", schema);
    return Post;
  };
