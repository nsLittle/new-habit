const FeedbackSchema = new mongoose.Schema(
    {
        habit: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
        teamMember: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember', required: true },
        feedbackText: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }
);

const Feedback = mongoose.model('Feedback', FeedbackSchema);
module.exports = Feedback;