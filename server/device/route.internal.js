const express = require('express');
const validate = require('express-validation');
const validation = require('./validation');
const controller = require('./controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(validate(validation.listInternal), controller.listInternal);

router.route('/:id')
  .get(validate(validation.get), controller.getInternal);

module.exports = router;
