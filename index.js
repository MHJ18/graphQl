import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs, resolvers } from "./Server.js";
import { ApolloServer } from "@apollo/server";
import Jwt from "jsonwebtoken";
import User from "./models/User.js";

const app = express();
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.Promise = global.Promise;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((res) => {
    if (res) {
      console.log("database connected");
    }
  });
// app.listen(process.env.PORT || 3000, () =>
//   console.log("server started successfully")
// );
const Server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(Server, {
  listen: { port: 4000 },
  context: ({ req }) => ({
    token: req.headers.authorization,
    verify() {
      if (!this.token) throw new Error("please login to access");
      let { id } = Jwt.verify(this.token, process.env.JWT_SECRET);
      return id;
    },
  }),
});
console.log(url);
