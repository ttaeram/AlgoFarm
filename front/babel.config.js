module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime', // 필요에 따라 추가
  ],
  assumptions: {
    setPublicClassFields: true,
    setSpreadProperties: true,
    privateFieldsAsProperties: true,
  },
};
