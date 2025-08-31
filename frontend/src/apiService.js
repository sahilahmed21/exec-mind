// frontend/src/apiService.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add the auth token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default {
    // === Authentication ===
    login(credentials) {
        return apiClient.post('/profile/login', credentials);
    },

    // === Scenario 1: After Meeting ===
    createMeetingSummary(data) {
        return apiClient.post('/meetings/summarize', data);
    },

    // === Scenario 2: Before Meeting ===
    getMeetingPrep(participantName) {
        return apiClient.get(`/meetings/prep/${participantName}`);
    },


    // New search function
    search(query) {
        return apiClient.get(`/search?q=${encodeURIComponent(query)}`);
    },


    // === Scenario 3: Idea Capture ===
    createIdea(payload) {
        if (payload instanceof FormData) {
            return apiClient.post('/ideas', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return apiClient.post('/ideas', payload);
    },

    // === Scenario 4: Friday Notes ===
    generateNewsletter(data) {
        return apiClient.post('/newsletters/generate', data);
    },
    getNewsletters() {
        return apiClient.get('/newsletters');
    },
    getNewsletterById(id) {
        return apiClient.get(`/newsletters/${id}`);
    },

    // === Scenario 5: Send Excerpt ===
    sendBookExcerpt(data) {
        return apiClient.post('/profile/send-excerpt', data);
    },

    // === Data Fetching for Dynamic UI ===
    getMeetings() {
        return apiClient.get('/meetings');
    },

    getIdeas(startDate) {
        return apiClient.get(`/ideas?startDate=${startDate}`);
    },

    getInsights(startDate) {
        return apiClient.get(`/insights?startDate=${startDate}`);
    },

    generateInsights() {
        return apiClient.post('/insights/generate');
    },

    analyzeDocument(query) {
        return apiClient.post('/analyst/query', { query });
    },
    getArchivedMeetings() {
        return apiClient.get('/meetings/archive');
    },
    askAboutMeeting(query) {
        return apiClient.post('/meetings/ask', { query });
    },

    synthesizeIdea(query) {
        return apiClient.post('/ideas/synthesize', { query });
    },

};
