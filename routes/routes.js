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

// route that creates a new user
router.post(
  '/users',
  asyncHandler(async (req, res) => {
    const newUser = await req.body;

    await User.create(newUser);
    res.status(201).location('/').end();
  })
);

// // Courses Routes

// route that returns all courses + user associated with each course
router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        },
      ],
    });

    res.status(200).json({ courses });
  })
);

// route that returns single course + user associated with course
router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    const course = await Course.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      where: { id: req.params.id },
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        },
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
    const newCourse = await Course.create(req.body);
    res.status(201).location(`/courses/${newCourse.id}`).end();
  })
  // })
);

// route that updates a single course
router.put(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    console.log(course);
    console.log(req.currentUser);

    if (course) {
      if (course.userId === req.currentUser.id) {
        await course.update({
          title: req.body.title,
          description: req.body.description,
        });
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
    const course = await Course.findByPk(req.params.id);
    console.log(course);
    console.log(req.currentUser);

    if (course) {
      if (course.userId === req.currentUser.id) {
        await course.destroy(course);
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
