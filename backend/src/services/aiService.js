// backend/src/services/aiService.js

const OpenAI = require('openai');
const { NEWSLETTER_PROMPT, MEETING_SUMMARY_PROMPT, IDEA_ANALYSIS_PROMPT, MEETING_BRIEF_PROMPT, EXCERPT_FINDER_PROMPT, WEEKLY_INSIGHT_GENERATION_PROMPT } = require('../utils/aiPrompts');

class AIService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async _callOpenAI(prompt, systemMessage) {
        try {
            const response = await this.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
            });
            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw new Error('Failed to get response from AI service');
        }
    }

    /**
     * Scenario 4: Generates a draft for the Friday Notes newsletter.
     */
    async generateNewsletter(context) {
        const { recentMeetings, recentIdeas, manualInputs, user } = context;

        // The prompt is now simpler, as the main instructions are baked into the system prompt.
        const prompt = `
        **Context for this week's email:**

        **Recent Meetings & Key Takeaways:**
        ${recentMeetings.map(m => `- ${m.title}: ${m.summary || 'No summary available.'}`).join('\n')}

        **Recent Ideas Captured:**
        ${recentIdeas.map(i => `- ${i.content}`).join('\n')}

        **Additional Manual Themes/Notes to Include:**
        ${manualInputs || 'None'}

        Based on the provided context, generate the newsletter in Marc Adee's voice.
        `;

        // The new prompt only needs the user's name.
        const systemPrompt = NEWSLETTER_PROMPT(user.name);
        return this._callOpenAI(prompt, systemPrompt);
    }

    /**
     * Scenario 1: Summarizes meeting content and extracts key info.
     */
    async summarizeAndExtract(meetingContent) {
        const systemPrompt = MEETING_SUMMARY_PROMPT();
        return this._callOpenAI(meetingContent, systemPrompt);
    }

    /**
     * Scenario 3: Analyzes a captured idea.
     */
    async analyzeIdea(ideaText) {
        const systemPrompt = IDEA_ANALYSIS_PROMPT();
        return this._callOpenAI(ideaText, systemPrompt);
    }

    /**
     * Scenario 2: Prepares a briefing for an upcoming meeting.
     */
    async prepareMeetingBrief(personName, pastMeetings) {
        const prompt = `
      **Person:** ${personName}
      **Past Meeting Summaries:**
      ${pastMeetings.map(m => `On ${new Date(m.date).toLocaleDateString()}: ${m.summary}\nKey Points: ${m.keyPoints.map(kp => kp.point).join(', ')}`).join('\n\n')}
    `;
        const systemPrompt = MEETING_BRIEF_PROMPT();
        return this._callOpenAI(prompt, systemPrompt);
    }

    /**
     * Generates strategic insights based on a week's worth of data.
     */
    async generateWeeklyInsights(context) {
        const { recentMeetings, recentIdeas } = context;

        const prompt = `
        **Meeting Summaries from the past week:**
        ${recentMeetings.map(m => `- ${m.title}: ${m.summary}`).join('\n')}

        **Ideas Captured in the past week:**
        ${recentIdeas.map(i => `- ${i.content}`).join('\n')}

        Based on the provided context, please generate your strategic analysis.
        `;

        const systemPrompt = WEEKLY_INSIGHT_GENERATION_PROMPT();
        return this._callOpenAI(prompt, systemPrompt);
    }

    /**
     * Scenario 5: Finds a relevant book excerpt.
     */
    async findBookExcerpt(query, allExcerpts) {
        const prompt = `
        **User Query:** "${query}"

        **Available Excerpts:**
        ${allExcerpts.map((e, i) => `[Excerpt ${i + 1}: ${e.title}]\n${e.content}\n---`).join('\n')}
      `;
        const systemPrompt = EXCERPT_FINDER_PROMPT();
        return this._callOpenAI(prompt, systemPrompt);
    }

    /**
     * MOCK: Transcribes audio to text.
     * In a real app, use a service like AssemblyAI, Deepgram, or OpenAI's Whisper.
     */
    async transcribeAudio(filePath) {
        console.log(`[MOCK] Transcribing audio from: ${filePath}`);
        // Simulate transcription
        await new Promise(resolve => setTimeout(resolve, 1500));
        return "This is a transcribed summary of the audio recording. The combined ratio is down, and adding two more underwriters is key. Also, remember the agent event in December.";
    }
}

module.exports = new AIService();