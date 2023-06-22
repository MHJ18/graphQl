import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { randomBytes } from "crypto";
import { User, author } from "./testdata.js";

const typeDefs = `#graphql 
    type Query{
        User:[Users]
        author:[Author]
        user(id:ID!):Users
        Author(id:ID!):[Author]
    }
    type Users{
        id:ID!
        name:String
        email:String
        password:String!
        quote:[Author]
    }
    type Author{
        by:ID
        name: String
    }
    type Mutation{
      addUser(user:newUser):Users
    }
    input newUser{
      name:String!
      email:String
      password:String
    }
`;
const resolvers = {
  Query: {
    User: () => {
      return User;
    },
    author: () => {
      return author;
    },
    user: (_, user) => User.find((res) => res.id === user.id),
    Author: (_, { id }) => author.filter((res) => res.by === id),
  },
  Users: {
    quote: (ur) => {
      if (author.filter((el) => el.by === ur.id).length <= 0) {
        return;
      }
      const result = author.filter((el) => el.by === ur.id);
      return result;
    },
  },
  Mutation: {
    addUser(_, { user }) {
      const id = randomBytes(4).toString("hex");
      User.push({
        id,
        ...user,
      });
      return User.find((res) => res.id === id);
    },
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
