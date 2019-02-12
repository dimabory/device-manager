const Joi = require('joi');

module.exports = {
  list: {
    query: {
      limit: Joi.number(),
      offset: Joi.number(),
    },
  },
  listInternal: {
    query: {
      serial_number: Joi.string(),
      device_type_id: Joi.string().uuid(),
    },
  },
  create: {
    body: {
      name: Joi.string().required(),
      serial_number: Joi.string().required(),
      device_type_id: Joi.string().uuid().required(),
    },
  },

  get: {
    params: {
      id: Joi.string().uuid().required(),
    },
  },

  update: {
    body: {
      name: Joi.string().required(),
    },
    params: {
      id: Joi.string().uuid().required(),
    },
  },

  remove: {
    params: {
      id: Joi.string().uuid().required(),
    },
  },
};
