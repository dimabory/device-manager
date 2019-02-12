const Joi = require('joi');

const resource = Joi.object().keys({
  topic: Joi.string().required(),
  method: Joi.string().valid(['pub', 'sub']).required(),
});

module.exports = {
  create: {
    body: {
      name: Joi.string().required(),
      description: Joi.string().required(),
      resources: Joi.array().items(resource).min(1).unique('topic')
        .required(),
    },
  },

  get: {
    params: {
      id: Joi.string().uuid().required(),
    },
  },

  update: {
    body: {
      name: Joi.string(),
      description: Joi.string(),
      resources: Joi.array().items(resource).min(1).unique('topic'),
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
