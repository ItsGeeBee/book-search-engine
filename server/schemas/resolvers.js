const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
          return userData;
        }
        throw new AuthenticationError('You need to be logged in!');
      },
    },
  
    Mutation: {
      addUser: async (parent, args) => {
        const user = await User.create(args);
        console.log(user)
        const token = signToken(user);
        return { token, user };
      },

      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AuthenticationError('Invalid credentials')
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
            throw new AuthenticationError('Invalid credentials')
        }
        const token = signToken(user);
        return {user, token};
    },
    saveBook: async (parent, { book }, context) => {
        if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id},
                { $addToSet: { savedBooks: book } },
                { new: true }
            )
            return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in first!')
    },
    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId }}},
                { new: true }
            )
            return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in first!');
    }
}
};

module.exports = resolvers;