exports.up = (pgm) => {
  pgm.createTable('device_types', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: { type: 'varchar(100)', notNull: true },
    description: { type: 'text', notNull: true },
    user_id: { type: 'uuid', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('device_type_resources', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    topic: { type: 'varchar(100)', notNull: true },
    method: { type: 'text', notNull: true },
    device_type_id: { type: 'uuid', notNull: true },
  });

  pgm.createIndex('device_types', 'lower(name)', {
    name: 'device_types_lower_case_name',
    unique: true,
  });

  pgm.createIndex('device_type_resources', 'device_type_id', {
    name: 'resources_device_type_id',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('device_types', 'name', {
    name: 'device_types_lower_case_name',
  });

  pgm.dropIndex('device_type_resources', 'device_type_id', {
    name: 'resources_device_type_id',
  });

  pgm.dropTable('device_types');
};
