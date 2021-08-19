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
    const user = await User.findAll({
      where: { emailAddress: req.body.emailAddress },
    });
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
router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    // return all courses
    const courses = await Course.findAll();
    // return 200 status code
    res.status(200).json(courses);
  })
);

// route that returns single course + user associated with course
router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    // return corresponding course
    const course = await Course.findByPk(req.params.id);
    // return User associated with course
    const userId = await course.userId;
    const user = await User.findAll({ where: { userId } });
    // return 200 status code
    res.status(200).json({ course, user });
  })
);

// route that creates a new course
router.post(
  '/courses',
  asyncHandler(async (req, res) => {
    // create new course
    const course = await Course.create(req.body);
    // set Location header to the URI for newly created course

    // return 201 Status code and no content
  })
);

// route that updates a single course
router.put(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    // update corresponding course
    // return 204 status code and no content
  })
);

// route that deletes a single course
router.delete(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    // get course
    // delete course
    // return 204 status code and no content
  })
);

module.exports = router;
