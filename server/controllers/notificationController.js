exports.createNotification = async (req, res) => {
    try {
      const { username } = req.params;
      const { message } = req.body;
      res.status(201).json({ message: 'Notification created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  };
  
  exports.getNotificationForUser = async (req, res) => {
    try {
      const { username } = req.params;
      res.status(200).json({ message: 'Notifications retrieved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve notifications' });
    }
  };  