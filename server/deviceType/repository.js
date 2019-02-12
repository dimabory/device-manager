const _ = require('lodash');
const db = require('../database');

function get(id, userId) {
  return db.oneOrNone(
    `SELECT t.*,
            array_to_json(
              array_agg(
                json_build_object('topic', r.topic, 'method', r.method))
            ) as resources
     FROM device_types as t
     LEFT OUTER JOIN device_type_resources as r
      ON r.device_type_id = t.id
     WHERE t.id = $1
       AND t.user_id = $2
     GROUP BY t.id`,
    [id, userId],
  );
}

function getInternal(id) {
  return db.oneOrNone(
    `SELECT t.*,
            array_to_json(
              array_agg(
                json_build_object('topic', r.topic, 'method', r.method))
            ) as resources
     FROM device_types as t
     LEFT OUTER JOIN device_type_resources as r
      ON r.device_type_id = t.id
     WHERE t.id = $1
     GROUP BY t.id`,
    id,
  );
}

function list(userId, limit, offset) {
  return db.any(
    `SELECT t.*,
            array_to_json(
              array_agg(
                json_build_object('topic', r.topic, 'method', r.method))
            ) as resources
      FROM device_types as t
      LEFT OUTER JOIN device_type_resources as r
       ON r.device_type_id = t.id
      WHERE t.user_id = $1
      GROUP BY t.id
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
}

function create(userId, name, description) {
  return db.one(
    `INSERT INTO device_types (name, description, user_id)
     VALUES($1, $2, $3)
     RETURNING *`,
    [name, description, userId],
  );
}

function createResources(deviceTypeId, resources) {
  const topics = _.map(resources, 'topic');
  const methods = _.map(resources, 'method');
  const deviceTypeIds = _.range(resources.length).map(() => deviceTypeId);

  return db.many(
    `INSERT INTO device_type_resources(topic, method, device_type_id)
     SELECT UNNEST($1), UNNEST($2), UNNEST($3::uuid[])
     RETURNING topic, method`,
    [topics, methods, deviceTypeIds],
  );
}

function update(id, userId, name, description) {
  return db.oneOrNone(
    `UPDATE device_types
     SET name = $1, description = $2, updated_at = now()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [name, description, id, userId],
  );
}

function remove(id, userId) {
  return db.result(
    `DELETE FROM device_types
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
}

function removeResources(deviceTypeId) {
  return db.result(
    `DELETE FROM device_type_resources
     WHERE device_type_id = $1`,
    [deviceTypeId],
  );
}

module.exports = {
  get,
  getInternal,
  list,
  create,
  createResources,
  update,
  remove,
  removeResources,
};
