import React, { useState, useEffect } from 'react';
import './ExecMindAgent.css';
import apiService from './apiService';
import useSpeechRecognition from './hooks/useSpeechRecognition';

// === Icon Components ===
const HomeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
    </svg>
);
const MeetingIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M19 19H5V8h14m-3-7v2H8V4H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14a2 2 0 002-2V8c0-1.1-.9-2-2-2h-1V4m-6 11h-2v-2h2v2z"></path>
    </svg>
);
const BookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"></path>
    </svg>
);
const BulbIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
    </svg>
);
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
    </svg>
);
const BriefingIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M14 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-4-6h8v2h-8V6zm0 3h8v2h-8V9zm-4 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
    </svg>
);


// === Reusable Helper Components ===
const Loader = () => <div className="loader" />;
const StateDisplay = ({ isLoading, error, successMessage }) => {
    if (isLoading)
        return (
            <div className="state-display loading">
                <Loader />
                <span>Processing...</span>
            </div>
        );
    if (error)
        return (
            <div className="state-display error">
                <span>❌</span> {error}
            </div>
        );
    if (successMessage)
        return (
            <div className="state-display success">
                <span>✅</span> {successMessage}
            </div>
        );
    return null;
};

// === Search Results Component ===
function SearchResults({ query, results, onViewDraft }) {
    if (!results) {
        return null;
    }

    const handleResultClick = (item) => {
        if (item.type === 'Newsletter') {
            onViewDraft(item._id);
        }
        // Future clicks for other types can be handled here
    };

    return (
        <div className="search-results-container">
            <div className="dashboard-header">
                <h1>Search Results for "{query}"</h1>
                <p>{results.length} item(s) found.</p>
            </div>
            {results.length > 0 ? (
                results.map(item => (
                    <div key={`${item.type}-${item._id}`} className="search-result-item" onClick={() => handleResultClick(item)}>
                        <div className="result-header">
                            <span className={`result-type-badge ${item.type.toLowerCase()}`}>{item.type}</span>
                            <span className="result-title">{item.title}</span>
                        </div>
                        <p className="result-snippet">{item.summary || item.content}</p>
                    </div>
                ))
            ) : (
                <div className="state-display">No results found.</div>
            )}
        </div>
    );
}

// === Component for viewing a single draft ===
function ViewDraft({ draftId, onBack }) {
    const [draft, setDraft] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!draftId) return;

        const fetchDraft = async () => {
            setIsLoading(true);
            setError('');
            try {
                const { data } = await apiService.getNewsletterById(draftId);
                setDraft(data);
            } catch (err) {
                setError('Failed to load the selected draft.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDraft();
    }, [draftId]);

    if (isLoading) return <div className="state-display loading"><Loader /> Loading draft...</div>;
    if (error) return <div className="state-display error">{error}</div>;
    if (!draft) return null;

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <div>
                    <h1>{draft.title}</h1>
                    <p>Draft from {new Date(draft.weekOf).toLocaleDateString()}</p>
                </div>
                <button className="btn-secondary" onClick={onBack}>← Back to Generator</button>
            </div>
            <div className="results-container newsletter-preview">
                {draft.sections.map((section, index) => (
                    <div key={index} className="newsletter-section">
                        <h4>{section.title}</h4>
                        <p dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// === Main Application Wrapper ===
export function ExecMindAgent({ onLogout }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [userName] = useState('Marc');
    const [selectedDraftId, setSelectedDraftId] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleViewDraft = (draftId) => {
        setSelectedDraftId(draftId);
        setCurrentView('viewDraft');
    };

    const handleSearch = async (query) => {
        if (!query.trim()) return;
        setSearchQuery(query);
        setIsSearching(true);
        try {
            const { data } = await apiService.search(query);
            setSearchResults(data);
            setCurrentView('searchResults');
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
            case 'fridayNotes': return <FridayNotesGenerator />;
            case 'viewDraft': return <ViewDraft draftId={selectedDraftId} onBack={() => setCurrentView('fridayNotes')} />;
            case 'searchResults': return <SearchResults query={searchQuery} results={searchResults} onViewDraft={handleViewDraft} />;
            case 'afterMeeting': return <AfterMeetingForm />;
            case 'beforeMeeting': return <BeforeMeetingForm />;
            case 'captureIdea': return <CaptureIdeaForm />;
            case 'sendExcerpt': return <SendExcerptForm />;
            default: return <Dashboard setCurrentView={setCurrentView} />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onLogout={onLogout}
                onViewDraft={handleViewDraft}
            />
            <div className="main-wrapper">
                <Header
                    userName={userName}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onSearch={handleSearch}
                    isSearching={isSearching}
                />
                <main className="content-area">{renderView()}</main>
            </div>
        </div>
    );
}

// === Layout Components ===
function Header({ userName, searchQuery, setSearchQuery, onSearch, isSearching }) {
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setSearchQuery(transcript);
        }
    }, [transcript, setSearchQuery]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isListening) stopListening();
        onSearch(searchQuery);
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
            onSearch(transcript);
        } else {
            startListening();
        }
    }

    return (
        <header className="main-header">
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
                <div className="search-bar" style={{ position: 'relative' }}>
                    <span className="search-icon"><SearchIcon /></span>
                    <input
                        type="text"
                        placeholder={`Ask ExecMind anything, ${userName}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="button"
                        className={`mic-button header-mic`}
                        onClick={handleMicClick}
                    >
                        {isListening ? '⏹️' : '🎤'}
                    </button>
                    {isSearching && <Loader />}
                </div>
            </form>
            <div className="header-actions">
                <button className="header-icon-btn">🔔</button>
                <div className="user-avatar">{userName.charAt(0)}</div>
            </div>
        </header>
    );
}

function Sidebar({ currentView, setCurrentView, onLogout, onViewDraft }) {
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
        const fetchRecentDrafts = async () => {
            try {
                const { data } = await apiService.getNewsletters();
                setDrafts(data);
            } catch (error) {
                console.error("Failed to fetch recent drafts:", error);
            }
        };

        fetchRecentDrafts();
    }, []);

    const shortcuts = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { id: 'fridayNotes', label: 'Friday Notes', icon: '📝' },
        { id: 'captureIdea', label: 'Capture Idea', icon: <BulbIcon /> },
        { id: 'afterMeeting', label: 'Process Meeting', icon: <MeetingIcon /> },
        { id: 'beforeMeeting', label: 'Before Meeting', icon: <BriefingIcon /> },
        { id: 'sendExcerpt', label: 'Send Excerpt', icon: <BookIcon /> },
    ];

    return (
        <aside className="sidebar">
            <div>
                <div className="sidebar-header">
                    <div className="brand-logo">EM</div>
                    <div className="brand-info">
                        <h2 className="brand-name">ExecMind</h2>
                        <div className="brand-edition">MarcMind Edition</div>
                    </div>
                </div>
                <div className="quick-action">
                    <button
                        className="invoke-button"
                        onClick={() => setCurrentView('captureIdea')}
                    >
                        Invoke ExecMind
                    </button>
                </div>
                <div className="sidebar-section">
                    <h3 className="sidebar-title">SHORTCUTS</h3>
                    <ul className="nav-menu">
                        {shortcuts.map((item) => (
                            <li
                                key={item.id}
                                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                                onClick={() => setCurrentView(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </li>
                        ))}
                    </ul>

                </div>
                <div className="sidebar-section">
                    <h3 className="sidebar-title">RECENT DRAFTS</h3>
                    <ul className="pending-actions-list">
                        {drafts.length > 0 ? (
                            drafts.map(draft => (
                                <li
                                    key={draft._id}
                                    className="pending-item"
                                    onClick={() => onViewDraft(draft._id)}
                                >
                                    <div className="pending-indicator"></div>
                                    <div className="pending-details">
                                        <div className="pending-title">
                                            {draft.title}
                                        </div>
                                        <div className="pending-meta">
                                            {new Date(draft.weekOf).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="pending-details" style={{ padding: '10px' }}>
                                <div className="pending-meta">No recent drafts found.</div>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
            <div className="sidebar-footer">
                <button className="logout-button" onClick={onLogout}>
                    <svg viewBox="0 0 24 24" height="1em" width="1em" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path>
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}


// === View Components ===
function Dashboard({ setCurrentView }) {
    const [insights, setInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const fetchInsights = async () => {
        setIsLoading(true);
        try {
            const { data } = await apiService.getInsights();
            setInsights(data);
        } catch (err) {
            setError('Could not load insights feed.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    const handleGenerateInsights = async () => {
        setIsGenerating(true);
        setError('');
        try {
            await apiService.generateInsights();
            await fetchInsights(); // Re-fetch to display the new insights
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate new insights.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <div>
                    <h1>Friday Notes & Insights</h1>
                    <p>AI-curated strategic insights and trending topics</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={handleGenerateInsights} disabled={isGenerating}>
                        {isGenerating ? <Loader /> : '✨'} Generate Weekly Insights
                    </button>
                    <button className="btn-primary" onClick={() => setCurrentView('fridayNotes')}>⚡ Generate Weekly Summary</button>
                </div>
            </div>
            <div className="stats-grid">
                <div className="stat-card">
                    <h4>Insights Read This Week</h4>
                    <div className="stat-value">12</div>
                    <div className="stat-delta positive">+4 from last week</div>
                </div>
                <div className="stat-card">
                    <h4>Suggestions Implemented</h4>
                    <div className="stat-value">6</div>
                    <div className="stat-delta">Ideas put into action</div>
                </div>
                <div className="stat-card">
                    <h4>Relevance Score</h4>
                    <div className="stat-value">8.9/10</div>
                    <div className="stat-delta">AI matching accuracy</div>
                </div>
                <div className="stat-card">
                    <h4>Time Saved</h4>
                    <div className="stat-value">3.2h</div>
                    <div className="stat-delta">Research time per week</div>
                </div>
            </div>
            <div className="insights-feed">
                {isLoading && <p>Loading insights...</p>}
                {error && <div className="state-display error">{error}</div>}
                {!isLoading && !error && insights.length === 0 && (
                    <div className="state-display loading">
                        <span>💡</span> No insights found for this week. Click "Generate Weekly Insights" to create them!
                    </div>
                )}
                {insights.map(insight => (
                    <div className="insight-card" key={insight._id}>
                        <div className="insight-content">
                            <h3>
                                {insight.title}
                                {insight.relevance === 'high' && <span className="badge">High Relevance</span>}
                            </h3>
                            <p>{insight.summary}</p>
                            <div className="insight-meta">
                                {insight.tags && insight.tags.map(tag => (
                                    <span key={tag} className={`tag ${tag.toLowerCase() === 'leadership' ? 'purple' : 'blue'}`}>{tag}</span>
                                ))}
                                {insight.readTime && <span>{insight.readTime} min read</span>}
                                {insight.source && <span>Source: {insight.source}</span>}
                            </div>
                            {insight.keyPoints && insight.keyPoints.length > 0 && (
                                <div className="key-insights">
                                    <h4>Key Insights</h4>
                                    <ul>
                                        {insight.keyPoints.map((point, index) => (
                                            <li key={index}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="insight-actions">
                            <button className="header-icon-btn">🔄</button>
                            <button className="header-icon-btn">🔗</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FridayNotesGenerator() {
    const [sources, setSources] = useState([]);
    const [isSourceLoading, setIsSourceLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [manualInputs, setManualInputs] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        if (!isListening && transcript) {
            setManualInputs(prev => prev ? `${prev} ${transcript}` : transcript);
        }
    }, [transcript, isListening]);

    useEffect(() => {
        const fetchSources = async () => {
            setIsSourceLoading(true);
            try {
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

                const [meetingsRes, ideasRes, insightsRes] = await Promise.all([
                    apiService.getMeetings(sevenDaysAgo),
                    apiService.getIdeas(sevenDaysAgo),
                    apiService.getInsights(sevenDaysAgo)
                ]);

                const meetings = meetingsRes.data.map(m => ({ ...m, type: 'meeting', date: m.date }));
                const ideas = ideasRes.data.map(i => ({ ...i, type: 'idea', date: i.createdAt }));
                const insights = insightsRes.data.map(i => ({ ...i, type: 'insight', date: i.createdAt }));

                const allSources = [...meetings, ...ideas, ...insights]
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                setSources(allSources);
            } catch (err) {
                setError('Failed to load sources. Please try again.');
                console.error(err);
            } finally {
                setIsSourceLoading(false);
            }
        };
        fetchSources();
    }, []);

    const toggleSelection = (id) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setResult(null);
        try {
            const payload = { manualInputs, weekOf: new Date().toISOString(), sourceIds: Array.from(selectedIds) };
            const { data } = await apiService.generateNewsletter(payload);
            setResult(data);
        } catch (err) { setError(err.response?.data?.error || 'Failed to generate newsletter.'); }
        finally { setIsLoading(false); }
    };

    const getSourceTypeLabel = (type) => {
        switch (type) {
            case 'meeting': return 'Meeting';
            case 'idea': return 'Idea';
            case 'insight': return 'Insight';
            default: return 'Source';
        }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Generate "Friday Notes"</h1>
                <p>Select the key meetings, ideas, and insights from this week to synthesize into your newsletter.</p>
            </div>
            <div className="friday-notes-container">
                <h3>Select Sources for this Week's Notes</h3>
                <div className="sources-list">
                    {isSourceLoading ? (<p>Loading recent activity...</p>) :
                        sources.map(source => (
                            <div key={source._id} className={`source-item ${selectedIds.has(source._id) ? 'selected' : ''}`} onClick={() => toggleSelection(source._id)}>
                                <div className={`type-indicator ${source.type}`}></div>
                                <div className="source-details">
                                    <div className="source-header">
                                        <span className="source-type">{getSourceTypeLabel(source.type)}</span>
                                        {source.title && <span className="source-title">{source.title}</span>}
                                    </div>
                                    <p className="source-summary">{source.summary || source.content}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <form onSubmit={handleSubmit} className="generation-form">
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label htmlFor="manualInputs">Any additional notes or themes?</label>
                        <textarea id="manualInputs" className="form-textarea" value={manualInputs} onChange={(e) => setManualInputs(e.target.value)} placeholder="e.g., Shout-out to the tech team for the portal launch..." />
                        <button
                            type="button"
                            className={`mic-button ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopListening : startListening}
                        >
                            🎤
                        </button>
                    </div>
                    <button type="submit" className="btn-primary full-width" disabled={isLoading || selectedIds.size === 0}>
                        {isLoading ? <Loader /> : `🚀 Generate Draft (${selectedIds.size} selected)`}
                    </button>
                </form>
            </div>
            <StateDisplay isLoading={isLoading} error={error} />
            {result && (
                <div className="results-container newsletter-preview">
                    <h2>{result.title}</h2>
                    {result.sections.map((section, index) => (
                        <div key={index} className="newsletter-section">
                            <h4>{section.title}</h4>
                            <p dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AfterMeetingForm() {
    const [formData, setFormData] = useState({ title: '', participants: '', meetingNotes: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [recentMeetings, setRecentMeetings] = useState([]);
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const { data } = await apiService.getMeetings();
                setRecentMeetings(data);
            } catch (err) {
                console.error("Failed to fetch recent meetings", err);
            }
        };
        fetchMeetings();
    }, []);

    useEffect(() => {
        if (!isListening && transcript) {
            setFormData(prev => ({
                ...prev,
                meetingNotes: prev.meetingNotes ? `${prev.meetingNotes} ${transcript}` : transcript
            }));
        }
    }, [transcript, isListening]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const payload = { ...formData, date: new Date().toISOString(), participants: formData.participants.split(',').map(name => ({ name: name.trim() })) };
            const { data } = await apiService.createMeetingSummary(payload);
            setSuccessMessage('Meeting summarized successfully!');
            setFormData({ title: '', participants: '', meetingNotes: '' });
            setRecentMeetings(prevMeetings => [data, ...prevMeetings]);
        } catch (err) { setError(err.response?.data?.error || 'Failed to process summary.'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>After the Meeting</h1>
                <p>Process notes for a concise summary and action items.</p>
            </div>
            <form onSubmit={handleSubmit} className="standard-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Meeting Title</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Participants (comma-separated)</label>
                        <input type="text" value={formData.participants} onChange={(e) => setFormData({ ...formData, participants: e.target.value })} required />
                    </div>
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                    <label>Meeting Notes or Transcript</label>
                    <textarea value={formData.meetingNotes} onChange={(e) => setFormData({ ...formData, meetingNotes: e.target.value })} required />
                    <button
                        type="button"
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={isListening ? stopListening : startListening}
                    >
                        🎤
                    </button>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '✨ Process Meeting'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />
            <div className="recent-ideas-container">
                <h3 className="sidebar-title">RECENTLY PROCESSED</h3>
                <div className="sources-list">
                    {recentMeetings.slice(0, 5).map(meeting => (
                        <div key={meeting._id} className="source-item">
                            <div className="type-indicator meeting"></div>
                            <div className="source-details">
                                <div className="source-header">
                                    <span className="source-title">{meeting.title}</span>
                                </div>
                                <p className="source-summary">{meeting.summary}</p>
                                <div className="insight-meta" style={{ marginTop: '8px' }}>
                                    <span>{new Date(meeting.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BeforeMeetingForm() {
    const [participantName, setParticipantName] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setResult(null);
        try {
            const { data } = await apiService.getMeetingPrep(participantName);
            setResult(data);
        } catch (err) { setError(err.response?.data?.error || 'Failed to get briefing.'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Before the Meeting</h1>
                <p>Get a strategic briefing on any individual.</p>
            </div>
            <form onSubmit={handleSubmit} className="standard-form">
                <div className="form-group">
                    <label>Participant's Full Name</label>
                    <input type="text" value={participantName} onChange={(e) => setParticipantName(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '🔍 Get Briefing'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} />
            {result && result.briefing && (
                <div className="results-container">
                    {/* Results rendering */}
                </div>
            )}
        </div>
    );
}

function CaptureIdeaForm() {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [recentIdeas, setRecentIdeas] = useState([]);
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        const fetchIdeas = async () => {
            try {
                const { data } = await apiService.getIdeas();
                setRecentIdeas(data);
            } catch (err) {
                console.error("Failed to fetch recent ideas", err);
            }
        };
        fetchIdeas();
    }, []);

    useEffect(() => {
        if (!isListening && transcript) {
            setContent(prev => prev ? `${prev} ${transcript}` : transcript);
        }
    }, [transcript, isListening]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) { setError("Idea content cannot be empty."); return; }
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const payload = { content: content, source: 'text' };
            const { data } = await apiService.createIdea(payload);
            setSuccessMessage(`Idea captured! AI classified it under '${data.category}'.`);
            setContent('');
            setRecentIdeas(prevIdeas => [data, ...prevIdeas]);
        } catch (err) { setError(err.response?.data?.error || 'Failed to capture idea.'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Capture an Idea</h1>
                <p>Jot down a thought, or use the microphone to dictate.</p>
            </div>
            <form onSubmit={handleSubmit} className="standard-form">
                <div className="form-group" style={{ position: 'relative' }}>
                    <label>What's on your mind?</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} />
                    <button
                        type="button"
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={isListening ? stopListening : startListening}
                    >
                        🎤
                    </button>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '💡 Capture Idea'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />
            <div className="recent-ideas-container">
                <h3 className="sidebar-title">RECENTLY CAPTURED</h3>
                <div className="sources-list">
                    {recentIdeas.slice(0, 5).map(idea => (
                        <div key={idea._id} className="source-item">
                            <div className="type-indicator idea"></div>
                            <div className="source-details">
                                <p className="source-summary">{idea.content}</p>
                                <div className="insight-meta" style={{ marginTop: '8px' }}>
                                    <span className="tag blue">{idea.category}</span>
                                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// === UPDATED COMPONENT ===
function SendExcerptForm() {
    const [formData, setFormData] = useState({ query: '', recipient: '', context: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [excerptHistory, setExcerptHistory] = useState([]); // State for history

    // Fetch user profile to get excerpt history on component mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Assumes an apiService.getProfile() method exists
                const { data: user } = await apiService.getProfile();
                if (user && user.sentExcerptsHistory) {
                    // Sort by date descending before setting
                    const sortedHistory = user.sentExcerptsHistory.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
                    setExcerptHistory(sortedHistory);
                }
            } catch (err) {
                console.error("Could not load excerpt history", err);
            }
        };
        fetchHistory();
    }, []);

    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        if (!isListening && transcript) {
            setFormData(prev => ({
                ...prev,
                context: prev.context ? `${prev.context} ${transcript}` : transcript
            }));
        }
    }, [transcript, isListening]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const { data } = await apiService.sendBookExcerpt(formData);
            setSuccessMessage(data.message);
            setFormData({ query: '', recipient: '', context: '' }); // Clear form

            // Optimistically add the new record to the history list
            if (data.historyRecord) {
                setExcerptHistory(prev => [data.historyRecord, ...prev]);
            }

        } catch (err) { setError(err.response?.data?.error || 'Failed to send excerpt.'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Send Book Excerpt</h1>
                <p>Instantly find and email a relevant passage from your book.</p>
            </div>
            <form onSubmit={handleSubmit} className="standard-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>What is the excerpt about?</label>
                        <input type="text" name="query" value={formData.query} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Recipient's Email</label>
                        <input type="email" name="recipient" value={formData.recipient} onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                    <label>Context for the email (optional)</label>
                    <textarea name="context" value={formData.context} onChange={handleChange} />
                    <button
                        type="button"
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={isListening ? stopListening : startListening}
                    >
                        🎤
                    </button>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '✉️ Find & Send'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />

            {/* Section to Display Sent History */}
            <div className="recent-ideas-container">
                <h3 className="sidebar-title">SEND HISTORY</h3>
                <div className="sources-list">
                    {excerptHistory.length > 0 ? (
                        excerptHistory.slice(0, 5).map(item => (
                            <div key={item._id} className="source-item">
                                <div className="source-details">
                                    <div className="source-header">
                                        <span className="source-title">To: {item.recipient}</span>
                                    </div>
                                    <p className="source-summary">"{item.excerptTitle}"</p>
                                    <div className="insight-meta" style={{ marginTop: '8px' }}>
                                        <span>{new Date(item.sentAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="pending-details" style={{ padding: '10px' }}>
                            <div className="pending-meta">No excerpts sent yet.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}