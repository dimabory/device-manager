const squel = require('squel');
const db = require('../database');

function get(id, userId) {
  return db.oneOrNone(
    `SELECT *
     FROM device
     WHERE id = $1
       AND user_id = $2`,
    [id, userId],
  );
}

function getInternal(id) {
  return db.oneOrNone(
    `SELECT *
     FROM device
     WHERE id = $1`,
    id,
  );
}

function listInternal(serialNumber, deviceTypeId) {
  const query = squel.select().from('device');

  if (serialNumber != null) {
    query.where('serial_number = $(serialNumber)');
  }

  if (deviceTypeId != null) {
    query.where('device_type_id = $(deviceTypeId)');
  }

  return db.any(query.toString(), { serialNumber, deviceTypeId });
}

function list(userId, limit, offset) {
  return db.any(
    `SELECT *
     FROM device
     WHERE user_id = $1
     ORDER BY created_at
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
}

function create(userId, name, serialNumber, deviceTypeId) {
  return db.one(
    `INSERT INTO device (name, serial_number, device_type_id, user_id)
     VALUES($1, $2, $3, $4)
     RETURNING *`,
    [name, serialNumber, deviceTypeId, userId],
  );
}

function update(id, userId, name) {
  return db.oneOrNone(
    `UPDATE device
     SET name = $1, updated_at = now()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [name, id, userId],
  );
}

function remove(id, userId) {
  return db.result(
    `DELETE FROM device
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
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
