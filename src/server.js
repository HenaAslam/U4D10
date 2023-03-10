import express from "express";
import mediasRouter from "./api/medias/index.js";
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
const server = express();
const port = process.env.PORT;
server.use(express.json());
server.use("/medias", mediasRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
