exports.up = (pgm) => {
  pgm.createExtension('uuid-ossp');

  pgm.createTable('device', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: { type: 'varchar(100)', notNull: true },
    serial_number: { type: 'text', notNull: true },
    device_type_id: { type: 'uuid', notNull: true },
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

  pgm.createIndex('device', 'lower(name)', {
    name: 'device_lower_case_name',
    unique: true,
  });

  pgm.createIndex('device', ['serial_number', 'device_type_id'], {
    name: 'device_serial_number',
    unique: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('device', 'name', {
    name: 'device_lower_case_name',
  });
  pgm.dropIndex('device', ['serial_number', 'device_type_id'], {
    name: 'device_serial_number',
  });
  pgm.dropTable('device');
  pgm.dropExtension('uuid-ossp');
};
