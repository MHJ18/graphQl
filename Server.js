import { ApolloServer } from "@apollo/server";
import { randomBytes } from "crypto";
import Quotes from "./models/quotes.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { error } from "console";

export const typeDefs = `#graphql 
    type Query{
        User:[Users]
        author:[Author]
        user(_id:ID!):Users
        Author(_id:ID!):[QuotewithUserName]
       
    }
    type QuotewithUserName{
      _id:ID
      name:String
      quote:String
      author:idname
    }
   type idname{
    _id: String
    name:String
   }
    type Users{
        _id:ID
        name:String
        email:String
        password:String
        quote:[Author]
    }
    type Author{
        _id:ID
        quote: String
        author:ID
        
    }
    type Token{
      token:String
      user:Users
    }
    type Mutation{
      addUser(user:newUser):Users
      login(userlogin:signIn):Token
      createQuote(quote:String):Author
    }
    input signIn{
     
      email:String!
      password:String!
    }
    input newUser{
      name:String!
      email:String
      password:String
    }
   
`;
export const resolvers = {
  Query: {
    User: async () => {
      return await User.find();
    },
    author: async () => {
      return await Quotes.find();
    },
    user: async (_, { _id }) => await User.findOne({ _id }),
    Author: async (_, { _id }) => {
      try {
        return await Quotes.find({ _id }).populate("author");
      } catch (error) {
        console.log(error.message);
      }
    },
  },
  Users: {
    quote: (ur) => {
      if (!User.find({ _id: ur._id })) {
        return;
      }
      const result = Quotes.find({ _id: ur._id });
      return result;
    },
  },
  Mutation: {
    async addUser(_, { user }) {
      if (!User.find({ email: user.email })) {
        throw new Error("User already exits ");
      }
      console.log("mutation called");
      //encrypt password using bcrypt?
      // generate a webtoken
      //save the token in db
      //return the jwt

      let password = await bcrypt.hash(user.password, 10);
      let users = await User.create({
        name: user.name,
        email: user.email,
        password,
      });

      return users;
    },
    async login(_, { userlogin }) {
      if (!User.findOne({ email: userlogin.email })) {
        throw new Error("user will this email and password is not found");
      }

      let find = await User.findOne({
        email: userlogin.email,
      });
      let checkPassword = await bcrypt.compare(
        userlogin.password,
        find.password
      );
      //how to change status on error in graphql?
      if (!checkPassword) {
        throw new Error("Error please check your email or password");
      }
      let token = jwt.sign({ id: find._id }, process.env.JWT_SECRET);
      return { token, user: find };
    },
    async createQuote(_, { quote }, req) {
      try {
        let id = req.verify();
        if (!id) {
          return;
        }
        let user = await User.findById(id);
        const quoteData = await Quotes.create({
          quote: quote,
          author: id,
        });
        return quoteData;
      } catch (error) {
        console.log(error.message);
        throw new Error(`Something went wrong${error.message}`);
      }
    },
  },
};
