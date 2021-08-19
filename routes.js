'use strict';

const express = require('express');

const router = express.Router();
const { User, Course } = require('./models');

// handler function to wrap each route
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

// User Routes

// route that returns all properties and values for current authenticated User
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const user = await User.findAll();
    res.status(200).json(user);
  })
);

// route that creates a new user
router.post(
  '/users',
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.status(201).json({ message: 'Account successfully created!' });
    } catch (err) {
      console.log('Error:', err.name);

      //checks if it's a validation error
      if (
        err.name === 'SequelizeValidationError' ||
        err.name === 'SequelizeUniqueConstraintError'
      ) {
        const errors = err.errors.map(err => err.message);
        res.status(400).json({ errors });
      } else {
        throw err;
      }
    }
  })
);

// Courses Routes

// route that returns all courses + users associated with each course

// route that returns single course + users associated with course

// route that creates a new course

// route that updates a single course

// route that deletes a single course

module.exports = router;
