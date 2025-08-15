const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // CORRECT
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        this.eaEmail = process.env.EA_EMAIL;
    }

    async sendToEA(subject, message, actionType = 'general') {
        try {
            const emailContent = this.formatEAEmail(subject, message, actionType);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: this.eaEmail,
                subject: `[ExecMind] ${subject}`,
                html: emailContent.html,
                text: emailContent.text
            };

            const result = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: result.messageId,
                sentAt: new Date()
            };
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Failed to send email to EA');
        }
    }

    async sendNewsletterDraft(newsletter, recipients) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipients.join(', '),
                subject: newsletter.title,
                html: this.formatNewsletterEmail(newsletter),
                text: newsletter.content
            };

            const result = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: result.messageId,
                sentTo: recipients,
                sentAt: new Date()
            };
        } catch (error) {
            console.error('Newsletter email sending error:', error);
            throw new Error('Failed to send newsletter');
        }
    }

    async sendMeetingFollowUp(meeting, recipient, followUpDate) {
        try {
            const subject = `Follow-up: ${meeting.title}`;
            const content = this.formatMeetingFollowUp(meeting, followUpDate);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipient,
                subject: subject,
                html: content.html,
                text: content.text
            };

            const result = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: result.messageId,
                sentAt: new Date()
            };
        } catch (error) {
            console.error('Follow-up email sending error:', error);
            throw new Error('Failed to send follow-up email');
        }
    }

    async sendBookExcerpt(recipient, excerpt, context) {
        try {
            const subject = 'Book Excerpt - As Requested';
            const content = this.formatBookExcerptEmail(excerpt, context);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipient,
                subject: subject,
                html: content.html,
                text: content.text
            };

            const result = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: result.messageId,
                sentAt: new Date()
            };
        } catch (error) {
            console.error('Book excerpt email sending error:', error);
            throw new Error('Failed to send book excerpt');
        }
    }

    async sendActionItemReminder(actionItem, recipient) {
        try {
            const subject = `Action Item Reminder: ${actionItem.description}`;
            const content = this.formatActionItemReminder(actionItem);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipient,
                subject: subject,
                html: content.html,
                text: content.text
            };

            const result = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: result.messageId,
                sentAt: new Date()
            };
        } catch (error) {
            console.error('Action item reminder email sending error:', error);
            throw new Error('Failed to send action item reminder');
        }
    }

    // Format EA email
    formatEAEmail(subject, message, actionType) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0;">ExecMind Action Request</h2>
          <p style="color: #7f8c8d; margin: 5px 0 0 0;">Action Type: <strong>${actionType}</strong></p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <h3 style="color: #2c3e50;">${subject}</h3>
          <div style="line-height: 1.6; color: #495057;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 8px;">
          <p style="margin: 0; color: #1565c0; font-size: 14px;">
            <strong>Note:</strong> This is an automated message from ExecMind. Please take the appropriate action as requested.
          </p>
        </div>
      </div>
    `;

        const text = `ExecMind Action Request\nAction Type: ${actionType}\n\n${subject}\n\n${message}\n\nThis is an automated message from ExecMind.`;

        return { html, text };
    }

    // Format newsletter email
    formatNewsletterEmail(newsletter) {
        return `
      <div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; background-color: #ffffff;">
        <header style="background-color: #2c3e50; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${newsletter.title}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Week of ${new Date(newsletter.weekOf).toLocaleDateString()}</p>
        </header>
        
        <div style="padding: 40px 30px;">
          ${newsletter.sections.map(section => `
            <section style="margin-bottom: 35px;">
              <h2 style="color: #2c3e50; font-size: 22px; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 8px;">
                ${section.title}
              </h2>
              <div style="line-height: 1.8; color: #2c3e50; font-size: 16px;">
                ${section.content.replace(/\n/g, '<br>')}
              </div>
            </section>
          `).join('')}
        </div>
        
        <footer style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Generated by ExecMind • ${new Date().toLocaleDateString()}
          </p>
        </footer>
      </div>
    `;
    }

    // Format meeting follow-up
    formatMeetingFollowUp(meeting, followUpDate) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0;">Meeting Follow-up Reminder</h2>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <h3 style="color: #2c3e50;">Meeting: ${meeting.title}</h3>
          <p><strong>Date:</strong> ${new Date(meeting.date).toLocaleDateString()}</p>
          <p><strong>Participants:</strong> ${meeting.participants.map(p => p.name).join(', ')}</p>
          <p><strong>Scheduled Follow-up:</strong> ${new Date(followUpDate).toLocaleDateString()}</p>
          
          <h4 style="color: #2c3e50; margin-top: 25px;">Key Points from Previous Meeting:</h4>
          <ul>
            ${meeting.keyPoints.map(kp => `<li>${kp.point}</li>`).join('')}
          </ul>
          
          ${meeting.actionItems.length > 0 ? `
            <h4 style="color: #2c3e50;">Previous Action Items:</h4>
            <ul>
              ${meeting.actionItems.map(ai => `
                <li>
                  ${ai.description} 
                  ${ai.assignedTo ? `(Assigned to: ${ai.assignedTo})` : ''}
                  <span style="color: ${ai.completed ? '#28a745' : '#dc3545'};">
                    ${ai.completed ? '✓ Completed' : '⏳ Pending'}
                  </span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;

        const text = `Meeting Follow-up Reminder\n\nMeeting: ${meeting.title}\nDate: ${new Date(meeting.date).toLocaleDateString()}\nParticipants: ${meeting.participants.map(p => p.name).join(', ')}\nScheduled Follow-up: ${new Date(followUpDate).toLocaleDateString()}\n\nKey Points:\n${meeting.keyPoints.map(kp => `• ${kp.point}`).join('\n')}\n\nAction Items:\n${meeting.actionItems.map(ai => `• ${ai.description} ${ai.assignedTo ? `(${ai.assignedTo})` : ''} - ${ai.completed ? 'Completed' : 'Pending'}`).join('\n')}`;

        return { html, text };
    }

    // Format book excerpt email
    formatBookExcerptEmail(excerpt, context) {
        const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #2c3e50; margin: 0;">Book Excerpt</h2>
          <p style="color: #6c757d; margin: 5px 0 0 0;">As requested</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-left: 4px solid #3498db; margin-bottom: 20px;">
          <div style="line-height: 1.8; color: #2c3e50; font-size: 16px; font-style: italic;">
            ${excerpt.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        ${context ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h4 style="color: #2c3e50; margin-top: 0;">Context:</h4>
            <p style="color: #6c757d; margin: 0;">${context}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            Best regards,<br>
            ExecMind Assistant
          </p>
        </div>
      </div>
    `;

        const text = `Book Excerpt - As Requested\n\n${excerpt}\n\n${context ? `Context: ${context}\n\n` : ''}Best regards,\nExecMind Assistant`;

        return { html, text };
    }

    // Format action item reminder
    formatActionItemReminder(actionItem) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #856404; margin: 0;">Action Item Reminder</h2>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #ffc107; border-radius: 8px;">
          <h3 style="color: #2c3e50;">${actionItem.description}</h3>
          <p><strong>Priority:</strong> ${actionItem.priority.toUpperCase()}</p>
          ${actionItem.dueDate ? `<p><strong>Due Date:</strong> ${new Date(actionItem.dueDate).toLocaleDateString()}</p>` : ''}
          ${actionItem.assignedTo ? `<p><strong>Assigned To:</strong> ${actionItem.assignedTo}</p>` : ''}
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #495057;">
              Please update the status of this action item or mark it as completed when done.
            </p>
          </div>
        </div>
      </div>
    `;

        const text = `Action Item Reminder\n\n${actionItem.description}\n\nPriority: ${actionItem.priority.toUpperCase()}\n${actionItem.dueDate ? `Due Date: ${new Date(actionItem.dueDate).toLocaleDateString()}\n` : ''}${actionItem.assignedTo ? `Assigned To: ${actionItem.assignedTo}\n` : ''}\nPlease update the status or mark as completed when done.`;

        return { html, text };
    }

    // Test email connection
    async testConnection() {
        try {
            await this.transporter.verify();
            return { success: true, message: 'Email service connected successfully' };
        } catch (error) {
            console.error('Email connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();