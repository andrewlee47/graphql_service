const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { type } = require('os');
const validator = require('validator');

const app = express();

// Read the GraphQL schema from a file (schema.graphql)
const schemaSDL = fs.readFileSync('./schema.graphql', 'utf-8');
const typeDefs = gql(schemaSDL);



// Your data (users array) and JWT secret
const users = [
  { id: '1', username: 'user1', email: 'user1@example.com', password: 'password1' },
  { id: '2', username: 'user2', email: 'user2@example.com', password: 'password2' },
];

const jwt_secret = 'secret-key';

// Your resolvers
const resolvers = {
  Query: {
    users: () => users,
  },
  

  Mutation: {
      signup: (_, { username, email, password }) => {
        // Your signup logic here
        // It should return a String, which seems to be a token in your case
        if (!validator.isEmail(email)){
          throw new Error('Inavlid email fromat');

        }
        if (!validator.isLength(username, {min: 3})) {
          throw new Error('Username must be at least 3 characters long');

        }

        if (!validator.isStrongPassword(password)) {
          throw new Error('Password is not strong enough');
        }

        const payload = {username, email};

    // Sign the token with your secret key
     const token = jwt.sign(payload, jwt_secret);

      return token;
      },
    },
  Mutation:{
    login: (_, { username, password }) => {
      const user = users.find((u) => u.username === username && u.password === password);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const token = jwt.sign({ username: user.username, email: user.email }, jwt_secret);
      return token;
    },
  },
};


// Create an Apollo Server and apply it to Express
const server = new ApolloServer({ 
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  });

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
}


// Start the Express server
startServer().then(() => {

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);

  });
});
