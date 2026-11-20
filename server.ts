// Vercel's Node server entry point. Local development continues to use `npm start`.
const { createServer } = require('./server.js');

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

createServer().listen(port, host, () => {
  console.log(`HyperPersonal running at http://${host}:${port}`);
});
