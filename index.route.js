const express = require('express');
const deviceRoutes = require('./server/device/route');
const deviceTypeRoutes = require('./server/deviceType/route');
const internalDeviceTypeRoutes = require('./server/deviceType/route.internal');
const internalDeviceRoutes = require('./server/device/route.internal');

const router = express.Router({});

router.get('/health', (req, res) => res.send({ status: 'ok' }));

router.use('/v1/device', deviceRoutes);
router.use('/v1/device-types', deviceTypeRoutes);

router.use('/internal/device', internalDeviceRoutes);
router.use('/internal/device-types', internalDeviceTypeRoutes);

module.exports = router;
