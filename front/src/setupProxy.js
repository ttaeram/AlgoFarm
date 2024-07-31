const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use(
    "/chat-websocket",
    createProxyMiddleware({ 
      target: "http://i11a302.p.ssafy.io:8080", 
      ws: true,
      changeOrigin: true 
    })
  );
};
