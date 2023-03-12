module.exports = mongoose => {
    var aboutSchema = mongoose.Schema(
      {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        about: [
        {
            title: {
                type: String,
                required: true,
                unique: true,
              },
              description: {
                type: String,
                required: true,
                unique: false,
              },
        },
        ],
      },
      { timestamps: true }
    );

    aboutSchema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    const About = mongoose.models.about || mongoose.model("about", aboutSchema);
    return About;
}