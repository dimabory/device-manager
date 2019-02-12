const express = require('express');
const validate = require('express-validation');
const validation = require('./validation');
const controller = require('./controller');
const auth = require('../helpers/authMiddleware');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(auth, validate(validation.list), controller.list)
  .post(auth, validate(validation.create), controller.create);

router.route('/:id')
  .get(auth, validate(validation.get), controller.get)
  .patch(auth, validate(validation.update), controller.update)
  .delete(auth, validate(validation.remove), controller.remove);

module.exports = router;
