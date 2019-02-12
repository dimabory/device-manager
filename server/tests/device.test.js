const chaiHttp = require('chai-http');
const {
  OK, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, NO_CONTENT, CREATED,
} = require('http-status');
const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');

chai.use(chaiHttp);

chai.config.includeStack = true;

const { request, expect } = chai;
const app = require('../..');
const db = require('../database');
const deviceTypes = require('../deviceType/repository');

describe('device', () => {
  const [userId, deviceTypeId, invalidDeviceTypeId] = [uuid(), uuid(), uuid()];
  let device = {
    name: 'test-device-name',
    serial_number: 'test-serial-number-1',
    device_type_id: deviceTypeId,
  };

  before(() => {
    sinon.stub(jwt, 'verify');

    jwt.verify.callsFake((token, secret, alg, callback) => {
      callback(null, { user_id: userId });
    });

    sinon.stub(deviceTypes, 'get');

    deviceTypes.get.withArgs(deviceTypeId, userId).callsFake(() => ({ id: deviceTypeId }));

    deviceTypes.get.withArgs(invalidDeviceTypeId, userId).callsFake(() => null);

    return db.none('TRUNCATE TABLE device');
  });

  after(() => {
    jwt.verify.restore();
    deviceTypes.get.restore();
    return db.none('TRUNCATE TABLE device');
  });

  describe('POST /api/v1/device', () => {
    it('should create a new device', async () => {
      const res = await request(app)
        .post('/api/v1/device')
        .set('authorization', 'Bearer test-user-token')
        .send(device);

      expect(res).to.have.status(CREATED);
      expect(res.body.name).to.equal(device.name);
      expect(res.body.user_id).to.equal(userId);
      expect(res.body.serial_number).to.equal(device.serial_number);
      expect(res.body.device_type_id).to.equal(device.device_type_id);
      device = res.body;
    });

    it('should return error if device-type does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/device')
        .set('authorization', 'Bearer test-user-token')
        .send({
          name: 'test-device-name-no-device-type',
          serial_number: 'test-serial-number',
          device_type_id: invalidDeviceTypeId,
        });

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if serial_number for the device-type already exists', async () => {
      const res = await request(app)
        .post('/api/v1/device')
        .set('authorization', 'Bearer test-user-token')
        .send({
          name: 'test-duplicate-device-name',
          serial_number: device.serial_number,
          device_type_id: device.device_type_id,
        });

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).post('/api/v1/device');
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/device/:id', () => {
    it('should get device details', async () => {
      const res = await request(app)
        .get(`/api/v1/device/${device.id}`)
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(OK);
      expect(res.body.name).to.equal(device.name);
      expect(res.body.user_id).to.equal(userId);
      expect(res.body.serial_number).to.equal(device.serial_number);
      expect(res.body.device_type_id).to.equal(device.device_type_id);
    });

    it('should return error for invalid paramenters', async () => {
      const res = await request(app)
        .get('/api/v1/device/aaaabbbb-cccc-dddd-eeee-ffff00001xxx')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return not found', async () => {
      const res = await request(app)
        .get('/api/v1/device/aaaabbbb-cccc-dddd-eeee-ffff00001111')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(NOT_FOUND);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).get(`/api/v1/device/${device.id}`);
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });

  describe('GET /api/internal/device', () => {
    it('should get device with filters (internal)', async () => {
      const res = await request(app).get('/api/internal/device');

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(1);
      expect(res.body.data[0].id).to.be.equal(device.id);
    });

    it('should get device with filters (serial_number)', async () => {
      const res = await request(app).get(`/api/internal/device?serial_number=${device.serial_number}`);

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(1);
      expect(res.body.data[0].id).to.be.equal(device.id);
      expect(res.body.data[0].serial_number).to.be.equal(device.serial_number);
    });

    it('should get device with filters (device_type_id)', async () => {
      const res = await request(app).get(`/api/internal/device?device_type_id=${device.device_type_id}`);

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(1);
      expect(res.body.data[0].id).to.be.equal(device.id);
      expect(res.body.data[0].device_type_id).to.be.equal(device.device_type_id);
    });

    it('should get device with filters (serial_number and device_type_id)', async () => {
      const res = await request(app).get(`/api/internal/device?serial_number=${device.serial_number}&device_type_id=${device.device_type_id}`);

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(1);
      expect(res.body.data[0].id).to.be.equal(device.id);
      expect(res.body.data[0].device_type_id).to.be.equal(device.device_type_id);
      expect(res.body.data[0].serial_number).to.be.equal(device.serial_number);
    });

    it('should not device with invalid filters (serial_number and device_type_id)', async () => {
      const res = await request(app).get(`/api/internal/device?serial_number=${device.serial_number}&device_type_id=${uuid()}`);

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(0);
    });

    it('should return error for invalid paramenters', async () => {
      const res = await request(app).get('/api/internal/device?device_type_id=aaaabbbb-cccc-dddd-eeee-ffff00001xxx');
      expect(res).to.have.status(BAD_REQUEST);
    });
  });

  describe('GET /api/internal/device/:id', () => {
    it('should get device details (internal)', async () => {
      const res = await request(app).get(`/api/internal/device/${device.id}`);

      expect(res).to.have.status(OK);
      expect(res.body.name).to.equal(device.name);
      expect(res.body.user_id).to.equal(userId);
      expect(res.body.serial_number).to.equal(device.serial_number);
      expect(res.body.device_type_id).to.equal(device.device_type_id);
    });

    it('should return error for invalid paramenters', async () => {
      const res = await request(app)
        .get('/api/internal/device/aaaabbbb-cccc-dddd-eeee-ffff00001xxx')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return not found', async () => {
      const res = await request(app)
        .get('/api/internal/device/aaaabbbb-cccc-dddd-eeee-ffff00001111')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(NOT_FOUND);
    });
  });

  describe('PATCH /api/v1/device/:id', () => {
    it('should update device details', async () => {
      device.name = 'updated-test-device-name';

      const res = await request(app)
        .patch(`/api/v1/device/${device.id}`)
        .set('authorization', 'Bearer test-user-token')
        .send(device);

      expect(res).to.have.status(OK);
      expect(res.body.name).to.equal('updated-test-device-name');
    });

    it('should return error for invalid paramenters', async () => {
      const res = await request(app)
        .patch('/api/v1/device/aaaabbbb-cccc-dddd-eeee-ffff00001xxx')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).patch(`/api/v1/device/${device.id}`);

      expect(res).to.have.status(UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/device', () => {
    it('should get all device', async () => {
      const res = await request(app)
        .get('/api/v1/device')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(1);
      expect(res.body.data[0].id).to.be.equal(device.id);
    });

    it('should get all device (with limit and offset)', async () => {
      const res = await request(app)
        .get('/api/v1/device')
        .set('authorization', 'Bearer test-user-token')
        .query({ limit: 10, offset: 1 });

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(0);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).get('/api/v1/device');
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });

  describe('DELETE /api/v1/device/:id', () => {
    it('should delete device', async () => {
      const res = await request(app)
        .delete(`/api/v1/device/${device.id}`)
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(NO_CONTENT);
    });

    it('should return error for invalid paramenters', async () => {
      const res = await request(app)
        .delete('/api/v1/device/aaaabbbb-cccc-dddd-eeee-ffff00001xxx')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).delete(`/api/v1/device/${device.id}`);
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });
});
