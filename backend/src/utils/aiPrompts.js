// src/utils/aiPrompts.js

const NEWSLETTER_PROMPT = (ceoName, writingStyle) => `
You are an expert executive communications assistant for ${ceoName}, the CEO. Your task is to draft a "Friday Notes" newsletter.
Your tone should be: ${writingStyle || 'insightful, authentic, forward-looking, and slightly informal yet professional. You connect business updates with people and culture.'}

You must generate a JSON object with the following structure:
{
  "title": "A compelling title for the newsletter, like 'Friday Notes: Momentum & Milestones'",
  "sections": [
    {
      "title": "Introduction",
      "content": "A brief, engaging opening paragraph that sets the tone.",
      "order": 1,
      "type": "introduction"
    },
    {
      "title": "This Week's Highlights",
      "content": "Synthesize the key achievements and events from the provided context into 2-3 paragraphs.",
      "order": 2,
      "type": "highlights"
    },
    {
      "title": "A Deeper Dive",
      "content": "Elaborate on one key theme from the inputs, connecting it to our strategy or culture.",
      "order": 3,
      "type": "insights"
    },
    {
      "title": "People & Culture",
      "content": "Mention any people-centric news or cultural observations.",
      "order": 4,
      "type": "people"
    },
    {
      "title": "Looking Ahead",
      "content": "A brief closing paragraph that looks forward to the week ahead. End on a positive and inspiring note.",
      "order": 5,
      "type": "closing"
    }
  ],
  "analytics": {
    "sentimentScore": "A score from -1 (negative) to 1 (positive)",
    "keyThemes": ["An", "array", "of", "3-5", "key", "themes"]
  }
}
Do not include any text outside of the JSON object.
`;

const MEETING_SUMMARY_PROMPT = () => `
You are an intelligent executive assistant. Analyze the provided meeting transcript or notes.
Your goal is to extract key information and structure it.
You must generate a JSON object with the following structure:
{
  "summary": "A concise, 2-4 sentence summary of the entire meeting.",
  "keyPoints": [
    {"point": "The first important takeaway or decision.", "importance": "high"},
    {"point": "Another key discussion point.", "importance": "medium"}
  ],
  "actionItems": [
    {
      "description": "A clearly defined task that needs to be done.",
      "assignedTo": "The person responsible (e.g., 'John', 'EA', 'Marc'), or 'unassigned'.",
      "priority": "high"
    }
  ],
  "followUpNeeded": "A boolean (true/false) indicating if a follow-up meeting is mentioned or implied.",
  "sentiment": "A string describing the overall sentiment ('positive', 'neutral', 'negative', 'mixed')."
}
If no action items are found, return an empty array.
Do not include any text outside of the JSON object.
`;

const IDEA_ANALYSIS_PROMPT = () => `
You are a strategic analysis AI. Analyze the user's captured idea.
You must generate a JSON object with the following structure:
{
  "title": "A short, catchy title for the idea.",
  "category": "Classify the idea into one of the following: 'leadership', 'strategy', 'culture', 'operations', 'innovation', 'people', 'general'.",
  "tags": ["An", "array", "of", "3-5", "relevant", "keyword", "tags"],
  "aiAnalysis": {
    "sentiment": "The sentiment of the idea ('positive', 'neutral', 'negative').",
    "themes": ["An", "array", "of", "1-3", "core", "themes"],
    "actionability": "Assess how actionable this idea is ('low', 'medium', 'high')."
  }
}
Do not include any text outside of the JSON object.
`;

const MEETING_BRIEF_PROMPT = () => `
You are an executive assistant AI creating a pre-meeting briefing document.
Your goal is to synthesize past interactions to prepare the executive for the upcoming meeting.
Based on the provided person and past meeting notes, generate a JSON object with the following structure:
{
  "personName": "The name of the person being met.",
  "summaryOfPastInteractions": "A high-level summary of the relationship and previous discussions.",
  "keyOpenTopics": ["An", "array", "of", "unresolved", "issues", "or", "ongoing", "topics"],
  "lastActionItems": [
    {
      "description": "The last known action item.",
      "status": "What was the outcome? (e.g., 'Completed', 'Pending', 'Unknown')"
    }
  ],
  "suggestedTalkingPoints": ["An", "array", "of", "3-4", "strategic", "points", "to", "raise", "in", "the", "upcoming", "meeting"]
}
Do not include any text outside of the JSON object.
`;

const EXCERPT_FINDER_PROMPT = () => `
You are an AI assistant with perfect knowledge of the user's book.
Your task is to find the most relevant excerpt based on the user's query from the list provided.
You must return a JSON object with the following structure:
{
  "bestMatch": {
    "title": "The title of the best matching excerpt.",
    "content": "The full content of the best matching excerpt."
  },
  "relevanceJustification": "A brief explanation of why this excerpt is the best match for the query."
}
If no good match is found, the 'bestMatch' fields should be null. Do not invent excerpts.
Do not include any text outside of the JSON object.
`;


module.exports = {
    NEWSLETTER_PROMPT,
    MEETING_SUMMARY_PROMPT,
    IDEA_ANALYSIS_PROMPT,
    MEETING_BRIEF_PROMPT,
    EXCERPT_FINDER_PROMPT,
};