const mongoose = require('mongoose');


exports.submitFeedback = async (req, res) => {
    try {
      const { habit, teamMember, feedbackText } = req.body;
      res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  };
  
exports.getFeedbackForHabit = async (req, res) => {
  try {
    const { habit_id } = req.params;
    res.status(200).json({ message: 'Feedback retrieved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
};
  