module.exports = mongoose => {
    var profileSchema = mongoose.Schema(
      {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        title:{
            type: String,
            default: null,
        },
        gender: {
          type: String,
          default: null,
        },
        birthday: {
          type: Date,
          default: null,
        },
        city: {
            type: String,
            default: null,
        },
        hobby:[{
            type: String,
            default: null,
        }],
      },
      { timestamps: true }
    );

    profileSchema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    const Profile = mongoose.models.profile || mongoose.model("profile", profileSchema);
    return Profile;
}