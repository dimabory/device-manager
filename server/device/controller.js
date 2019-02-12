const httpStatus = require('http-status');
const repository = require('./repository');
const deviceTypes = require('../deviceType/repository');

async function get(req, res, next) {
  try {
    const device = await repository.get(req.params.id, req.user.user_id);
    if (device == null) {
      return next({ status: httpStatus.NOT_FOUND });
    }
    return res.json(device);
  } catch (e) { return next(e); }
}

async function getInternal(req, res, next) {
  try {
    const device = await repository.getInternal(req.params.id);
    if (device == null) {
      return next({ status: httpStatus.NOT_FOUND });
    }
    return res.json(device);
  } catch (e) { return next(e); }
}

async function listInternal(req, res, next) {
  try {
    const device = await repository.listInternal(req.query.serial_number, req.query.device_type_id);
    if (device == null) {
      return next({ status: httpStatus.NOT_FOUND });
    }
    return res.json({ data: device });
  } catch (e) { return next(e); }
}

async function list(req, res, next) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const device = await repository.list(req.user.user_id, limit, offset);
    return res.json({ data: device });
  } catch (e) { return next(e); }
}

async function create(req, res, next) {
  try {
    const { name, serial_number: sn, device_type_id: deviceTypeId } = req.body;
    const deviceType = await deviceTypes.get(deviceTypeId, req.user.user_id);
    if (deviceType == null) {
      return next({ status: httpStatus.BAD_REQUEST, message: 'device-type not found' });
    }
    const device = await repository.create(req.user.user_id, name, sn, deviceTypeId);
    return res.status(httpStatus.CREATED).json(device);
  } catch (e) {
    if (e.code === '23505') {
      e.message = `duplicate serial_number ${req.body.serial_number} for device_type ${req.body.device_type_id}`;
      e.status = httpStatus.BAD_REQUEST;
    }
    return next(e);
  }
}

async function update(req, res, next) {
  try {
    const { name } = req.body;
    const device = await repository.update(req.params.id, req.user.user_id, name);
    if (device == null) {
      return next({ status: httpStatus.NOT_FOUND });
    }
    return res.json(device);
  } catch (e) { return next(e); }
}

async function remove(req, res, next) {
  try {
    const result = await repository.remove(req.params.id, req.user.user_id);
    if (result.rowCount === 0) {
      return next({ status: httpStatus.NOT_FOUND });
    }
    return res.status(httpStatus.NO_CONTENT).json();
  } catch (e) { return next(e); }
}

module.exports = {
  get,
  getInternal,
  list,
  listInternal,
  create,
  update,
  remove,
};
