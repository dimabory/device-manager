const _ = require('lodash');
const httpStatus = require('http-status');
const repository = require('./repository');

async function get(req, res, next) {
  try {
    const deviceType = await repository.get(req.params.id, req.user.user_id);
    if (deviceType == null) {
      return next({ status: httpStatus.NOT_FOUND });
    }
    return res.json(deviceType);
  } catch (e) { return next(e); }
}

async function getInternal(req, res, next) {
  try {
    const deviceType = await repository.getInternal(req.params.id);
    if (deviceType == null) {
      return next({ status: httpStatus.NOT_FOUND });
    }
    return res.json(deviceType);
  } catch (e) { return next(e); }
}

async function list(req, res, next) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const deviceTypes = await repository.list(req.user.user_id, limit, offset);
    return res.json({ data: deviceTypes });
  } catch (e) { return next(e); }
}

async function create(req, res, next) {
  try {
    const { name, description } = req.body;

    const deviceType = await repository.create(req.user.user_id, name, description);
    const resources = await repository.createResources(deviceType.id, req.body.resources);

    return res.status(httpStatus.CREATED).json(_.merge(deviceType, { resources }));
  } catch (e) {
    if (e.code === '23505') {
      e.message = 'duplicate name';
      e.status = httpStatus.BAD_REQUEST;
    }
    return next(e);
  }
}

async function update(req, res, next) {
  try {
    const deviceType = await repository.get(req.params.id, req.user.user_id);

    if (deviceType == null) {
      return next({ status: httpStatus.NOT_FOUND });
    }

    _.merge(deviceType, _.omit(req.body, ['resources']));

    const updatedDeviceType = await repository.update(req.params.id,
      req.user.user_id,
      deviceType.name,
      deviceType.description);

    if (req.body.resources != null) {
      await repository.removeResources(deviceType.id);
      const resources = await repository.createResources(deviceType.id, req.body.resources);

      return res.json(_.merge(updatedDeviceType, { resources }));
    }
    return res.json(_.merge(updatedDeviceType, { resources: deviceType.resources }));
  } catch (e) { return next(e); }
}

async function remove(req, res, next) {
  try {
    const removed = await repository.remove(req.params.id, req.user.user_id);
    if (removed.rowCount === 0) {
      return next({ status: httpStatus.NOT_FOUND });
    }
    await repository.removeResources(req.params.id);
    return res.status(httpStatus.NO_CONTENT).json();
  } catch (e) { return next(e); }
}

module.exports = {
  get,
  getInternal,
  create,
  update,
  list,
  remove,
};
