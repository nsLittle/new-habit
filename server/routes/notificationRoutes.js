const express = require('express');
const { createNotification, getNotificationForUser } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/:username', protect, createNotification);
router.get('/:username', protect, getNotificationForUser);

module.exports = router;