// src/services/calendarService.js

const emailService = require('./emailService');

class CalendarService {
    /**
     * MOCK: Schedules a follow-up meeting.
     * Instead of integrating with a real calendar API for this demo,
     * it sends an instruction email to the Executive Assistant.
     */
    async scheduleFollowUp(meeting, user) {
        try {
            const subject = `Meeting Follow-up Scheduling Request: ${meeting.title}`;
            const message = `
        Hi,

        Please schedule a follow-up meeting for the "${meeting.title}" meeting that occurred on ${new Date(meeting.date).toLocaleDateString()}.

        **Participants:**
        ${meeting.participants.map(p => `- ${p.name}`).join('\n')}

        **Requested Follow-up Timeframe:**
        Approximately 4 weeks from the original meeting date. Please find a suitable time.

        Thank you.
      `;

            console.log(`[MOCK CALENDAR] Requesting follow-up for meeting ID: ${meeting._id}`);

            // Send email to EA instead of hitting a calendar API
            if (user.eaEmail) {
                await emailService.sendToEA(subject, message, 'schedule-meeting');
                return { success: true, message: 'Follow-up request sent to EA.' };
            } else {
                return { success: false, message: 'EA email not configured.' };
            }

        } catch (error) {
            console.error('Error in scheduleFollowUp service:', error);
            throw new Error('Failed to schedule follow-up.');
        }
    }
}

module.exports = new CalendarService();