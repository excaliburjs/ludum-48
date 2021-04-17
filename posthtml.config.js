module.exports = {
  plugins: {
    "posthtml-expressions": {
      locals: {
        commitRef() {
          return process.env.COMMIT_REF || "local";
        },
      },
    },
  },
};
