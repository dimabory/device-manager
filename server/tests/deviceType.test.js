const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const {
  OK, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, NO_CONTENT, CREATED,
} = require('http-status');

chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const { request, expect } = chai;

chai.config.includeStack = true;

const app = require('../../');
const db = require('../database');

describe('device-types', () => {
  const userId = uuid();

  before(() => {
    sinon.stub(jwt, 'verify');

    jwt.verify.callsFake((token, secret, alg, callback) => {
      callback(null, { user_id: userId });
    });

    return db.none('TRUNCATE TABLE device_types, device_type_resources');
  });

  after(() => {
    jwt.verify.restore();

    return db.none('TRUNCATE TABLE device_types, device_type_resources');
  });

  let deviceType = {
    name: 'test device-type',
    description: 'test description',
    resources: [
      { topic: 'test/pub', method: 'pub' },
      { topic: 'test/sub', method: 'sub' },
    ],
  };

  describe('POST /api/v1/device-types', () => {
    it('should create a new device-type', async () => {
      const res = await request(app)
        .post('/api/v1/device-types')
        .set('authorization', 'Bearer test-user-token')
        .send(deviceType);

      expect(res).to.have.status(CREATED);
      expect(res.body.name).to.equal(deviceType.name);
      expect(res.body.user_id).to.equal(userId);
      expect(res.body.description).to.equal(deviceType.description);
      expect(res.body.resources).to.deep.equalInAnyOrder(deviceType.resources);

      deviceType = res.body;
    });

    it('should return error if name for the device-type already exists', async () => {
      const res = await request(app)
        .post('/api/v1/device-types')
        .set('authorization', 'Bearer test-user-token')
        .send({
          name: deviceType.name,
          description: 'test description',
          resources: [{ topic: 'test/pub', method: 'pub' }],
        });

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if resources are not valid (topics not unique)', async () => {
      const res = await request(app)
        .post('/api/v1/device-types')
        .set('authorization', 'Bearer test-user-token')
        .send({
          name: 'test invalid',
          description: 'test description',
          resources: [
            { topic: 'test/pub', method: 'pub' },
            { topic: 'test/pub', method: 'sub' },
          ],
        });

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if resources are not valid (invalid method)', async () => {
      const res = await request(app)
        .post('/api/v1/device-types')
        .set('authorization', 'Bearer test-user-token')
        .send({
          name: 'test invalid',
          description: 'test description',
          resources: [
            { topic: 'test/pub', method: 'pub' },
            { topic: 'test/sub', method: 'foo' },
          ],
        });

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if resources are not valid (no resources)', async () => {
      const res = await request(app)
        .post('/api/v1/device-types')
        .set('authorization', 'Bearer test-user-token')
        .send({
          name: 'test invalid',
          description: 'test description',
          resources: [],
        });

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).post('/api/v1/device-types');
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/device-types/:id', () => {
    it('should get device-type details', async () => {
      const res = await request(app)
        .get(`/api/v1/device-types/${deviceType.id}`)
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(OK);
      expect(res.body.name).to.equal(deviceType.name);
      expect(res.body.user_id).to.equal(userId);
      expect(res.body.description).to.equal(deviceType.description);
      expect(res.body.resources).to.deep.equalInAnyOrder(deviceType.resources);
    });

    it('should return not found', async () => {
      const res = await request(app)
        .get('/api/v1/device-types/aaaabbbb-cccc-dddd-eeee-ffff00001111')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(NOT_FOUND);
    });

    it('should return error for invalid parameters', async () => {
      const res = await request(app)
        .get('/api/v1/device-types/aaaabbbb-cccc-dddd-eeee-ffff00001xxx')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).get(`/api/v1/device-types/${deviceType.id}`);
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });

  describe('GET /api/internal/device-types/:id', () => {
    it('should get device-type details', async () => {
      const res = await request(app).get(`/api/internal/device-types/${deviceType.id}`);

      expect(res).to.have.status(OK);
      expect(res.body.name).to.equal(deviceType.name);
      expect(res.body.user_id).to.equal(userId);
      expect(res.body.description).to.equal(deviceType.description);
      expect(res.body.resources).to.deep.equalInAnyOrder(deviceType.resources);
    });

    it('should return not found', async () => {
      const res = await request(app).get('/api/internal/device-types/aaaabbbb-cccc-dddd-eeee-ffff00001111');
      expect(res).to.have.status(NOT_FOUND);
    });

    it('should return error for invalid parameters', async () => {
      const res = await request(app).get('/api/internal/device-types/aaaabbbb-cccc-dddd-eeee-ffff00001xxx');
      expect(res).to.have.status(BAD_REQUEST);
    });
  });

  describe('PATCH /api/v1/device-types/:id', () => {
    it('should update device-type name', async () => {
      deviceType.name = 'updated test device-type name';

      const res = await request(app)
        .patch(`/api/v1/device-types/${deviceType.id}`)
        .set('authorization', 'Bearer test-user-token')
        .send(deviceType);

      expect(res).to.have.status(OK);
      expect(res.body.name).to.equal('updated test device-type name');
    });

    it('should update device-type description', async () => {
      deviceType.description = 'updated test description';

      const res = await request(app)
        .patch(`/api/v1/device-types/${deviceType.id}`)
        .set('authorization', 'Bearer test-user-token')
        .send(deviceType);

      expect(res).to.have.status(OK);
      expect(res.body.description).to.equal('updated test description');
    });

    it('should update device-type resources', async () => {
      deviceType.resources = [
        { topic: 'updated/pub', method: 'pub' },
        { topic: 'updated/sub', method: 'sub' },
      ];

      const res = await request(app)
        .patch(`/api/v1/device-types/${deviceType.id}`)
        .set('authorization', 'Bearer test-user-token')
        .send(deviceType);

      expect(res).to.have.status(OK);
      expect(res.body.resources).to.deep.equalInAnyOrder(deviceType.resources);
    });

    it('should return error for invalid parameters', async () => {
      const res = await request(app)
        .patch('/api/v1/device-types/aaaabbbb-cccc-dddd-eeee-ffff00001xxx')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).patch(`/api/v1/device-types/${deviceType.id}`);
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/device-types', () => {
    it('should get all device-types', async () => {
      const res = await request(app)
        .get('/api/v1/device-types')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(1);
      expect(res.body.data[0].id).to.be.equal(deviceType.id);
      expect(res.body.data[0].resources.length).to.be.equal(2);
      expect(res.body.data[0].resources).to.deep.equalInAnyOrder(deviceType.resources);
    });

    it('should get all device-types (with limit and offset)', async () => {
      const res = await request(app)
        .get('/api/v1/device-types')
        .set('authorization', 'Bearer test-user-token')
        .query({ limit: 10, offset: 1 });

      expect(res).to.have.status(OK);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.equal(0);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).get('/api/v1/device-types');
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });

  describe('DELETE /api/v1/device-types/:id', () => {
    it('should delete device-type', async () => {
      const res = await request(app)
        .delete(`/api/v1/device-types/${deviceType.id}`)
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(NO_CONTENT);
    });

    it('should return error for invalid parameters', async () => {
      const res = await request(app)
        .delete('/api/v1/device-types/aaaabbbb-cccc-dddd-eeee-ffff00001xxx')
        .set('authorization', 'Bearer test-user-token');

      expect(res).to.have.status(BAD_REQUEST);
    });

    it('should return error if unauthorized', async () => {
      const res = await request(app).delete(`/api/v1/device-types/${deviceType.id}`);
      expect(res).to.have.status(UNAUTHORIZED);
    });
  });
});
