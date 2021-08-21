'use strict';

const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const { User, Course } = require('../models');
const { authenticateUser } = require('../middleware/auth-user');

// handler function to wrap each route
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      console.log(err);
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

// User Routes

// route that returns all properties and values for current authenticated User
router.get(
  '/users',
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      where: { id: req.currentUser.id },
    });
    res.status(200).json(user);
  })
);

// route that creates a new user -WORKS
router.post(
  '/users',
  asyncHandler(async (req, res) => {
    const newUser = await req.body;
    console.log(req.body);

    const errors = [];

    if (!newUser.firstName) {
      errors.push("Please provide a value for 'First Name'");
    }

    if (!newUser.lastName) {
      errors.push("Please provide a value for 'Last Name'");
    }

    if (!newUser.emailAddress) {
      errors.push("Please provide a value for 'Email Address'");
    }

    let password = newUser.password;
    if (!newUser.password) {
      errors.push("Please provide a value for 'Password'");
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

// // Courses Routes

// route that returns all courses + user associated with each course
router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    // return all courses
    const courses = await Course.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: User,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
    });

    // retutn user
    // return 200 status code
    res.status(200).json({ courses });
  })
);

// route that returns single course + user associated with course
router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    // return corresponding course
    const course = await Course.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      where: { id: req.params.id },
      include: [
        { model: User, attributes: { exclude: ['createdAt', 'updatedAt'] } },
      ],
    });
    res.status(200).json({ course });
  })
);

// route that creates a new course
router.post(
  '/courses',
  authenticateUser,
  asyncHandler(async (req, res) => {
    const newCourse = req.body;

    const errors = [];

    if (!newCourse.title) {
      errors.push("Please provide a value for 'title'");
    }

    if (!newCourse.description) {
      errors.push("Please provide a value for 'description'");
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
    } else {
      // create new course
      await Course.create(newCourse);
      // set Location header to the URI for newly created course
      // return 201 Status code and no content
      res.status(201).location(`/courses/${newCourse.id}`).end();
    }
  })
);

// route that updates a single course
router.put(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res) => {
    // update corresponding course
    const course = await Course.findByPk(req.params.id);

    if (course) {
      if (course === req.currentUser) {
        await course.update({
          title: req.body.title,
          description: req.body.description,
        });
        // return 204 status code and no content
        res.status(204).end();
      } else {
        res.status(403).end();
      }
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  })
);

// route that deletes a single course
router.delete(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res) => {
    // get course
    const course = await Course.findByPk(req.params.id);

    if (course) {
      if (course === req.currentUser) {
        // delete course
        await course.destroy(course);
        // return 204 status code and no content
        res.status(204).end();
      } else {
        res.status(403).end();
      }
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  })
);

module.exports = router;
