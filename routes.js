'use strict';

const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const { User, Course } = require('./models');

// handler function to wrap each route
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      if (
        err.name === 'SequelizeValidationError' ||
        err.name === 'SequelizeUniqueConstraintError'
      ) {
        console.log('Error:', err.name);
        const errors = err.errors.map(err => err.message);
        res.status(400).json({ errors });
      } else {
        next(err);
      }
    }
  };
}

// handler function to check for validation errors
// function validationHandler(err) {
//checks if it's a validation error
// }

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
    const newUser = req.body;

    const errors = [];

    if (!newUser.firstName) {
      errors.push('Please provide a value for "First Name"');
    }

    if (!newUser.lastName) {
      errors.push('Please provide a value for "Last Name"');
    }

    if (!newUser.emailAddress) {
      errors.push('Please provide a value for "Email Address"');
    }

    let password = newUser.password;
    if (!newUser.password) {
      errors.push('Please provide a value for "Password"');
    } else {
      newUser.password = bcrypt.hashSync(password, 10);
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
    } else {
      await User.create(newUser);
      res.status(201).json({ message: 'Account successfully created!' });
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
    const newCourse = req.body;

    const errors = [];

    if (!newCourse.title) {
      errors.push('Please provide a value for "title"');
    }

    if (!newCourse.description) {
      errors.push('Please provide a value for "description"');
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
    } else {
      // create new course
      await Course.create(newCourse);
      // set Location header to the URI for newly created course
      // return 201 Status code and no content
      res.status(201).location(`/courses/${course.id}`).end();
    }
  })
);

// route that updates a single course
router.put(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    // update corresponding course
    const course = await Course.findByPk(req.params.id);

    if (course) {
      course.title = req.body.title;
      course.description = req.body.description;
      await Course.update(course);
      // return 204 status code and no content
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  })
);

// route that deletes a single course
router.delete(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    // get course
    const course = await Course.findByPk(req.params.id);
    // delete course
    await Course.destroy(course);
    // return 204 status code and no content
    res.status(204).end();
  })
);

module.exports = router;
