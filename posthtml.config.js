module.exports = {
  plugins: {
    "posthtml-expressions": {
      locals: {
        commitRef() {
          return process.env.GITHUB_SHA || "local";
        },
      },
    },
  },
};
