// This is your internal knowledge base of saved meeting summaries
const meetingSummaries = [
    {
        id: 'hr_ops_aug16',
        title: 'HR Ops Meeting – Friday, Aug 16',
        keywords: ['hr ops', 'human resources', 'onboarding'],
        summary: `
- Main discussion: Addressing employee retention and onboarding delays.
- Decision: Roll out GenAI-driven onboarding assistant pilot in Q4.
- Action items: HR Ops to shortlist vendors (by Aug 25). IT to assess integration feasibility with current HRMS (by Aug 30).
- Follow-up: Review meeting on Sep 5.
- Outcome: Consensus that automating onboarding touchpoints will improve employee satisfaction and reduce HR workload.`
    },
    {
        id: 'product_roadmap_aug12',
        title: 'Strategy Session – Product Roadmap – Monday, Aug 12',
        keywords: ['product roadmap', 'strategy session', 'saas'],
        summary: `
- Main discussion: 2025 roadmap for the company’s SaaS platform.
- Decision: Prioritize AI features (smart recommendations, automation) over UI redesign for next release.
- Action items: Product team to create AI feature backlog (by Aug 22). Engineering to prepare resource estimates (by Aug 28). Design to start groundwork for minor UI enhancements.
- Outcome: Agreement that AI-led differentiation will be more valuable in the short term to attract enterprise customers.`
    }
];

// This function simulates the "Retrieval" part of RAG
const retrieveMeetingSummary = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const foundMeeting = meetingSummaries.find(meeting =>
        meeting.keywords.some(keyword => lowerCaseQuery.includes(keyword))
    );
    return foundMeeting;
};

// Function to get all archived meetings
const getArchivedMeetings = () => {
    return meetingSummaries;
};

module.exports = { retrieveMeetingSummary, getArchivedMeetings };