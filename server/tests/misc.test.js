const chai = require('chai');
const chaiHttp = require('chai-http');
const { OK, NOT_FOUND } = require('http-status');

chai.use(chaiHttp);

chai.config.includeStack = true;

const { request, expect } = chai;

const app = require('../..');

describe('misc', () => {
  describe('GET /api/health', () => {
    it('should return 200', async () => {
      const res = await request(app).get('/api/health');
      expect(res).to.have.status(OK);
      expect(res.body.status).to.equal('ok');
    });
  });

  describe('GET /api/invalid', () => {
    it('should return 404 status', async () => {
      const res = await request(app).get('/api/invalid');
      expect(res).to.have.status(NOT_FOUND);
    });
  });
});
