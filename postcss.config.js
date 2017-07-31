module.exports = () => ({
  plugins: {
    autoprefixer: {
      browsers: [
        'last 3 version',
        'ie >= 9',
        'iOS >=8',
        'Safari >=8',
      ],
    },
  },
});
