const express = require('express');
const router = express.Router();

router.use('/account', require('./account'));
router.use('/account/friends', require('./friends'));
module.exports = router;
