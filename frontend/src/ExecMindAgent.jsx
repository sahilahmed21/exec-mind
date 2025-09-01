// frontend/src/ExecMindAgent.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ExecMindAgent.css';
import apiService from './apiService';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import VoiceVisualizer from './components/VoiceVisualizer';
import useTextToSpeech from './hooks/useTextToSpeech';
import { Volume2, Play, Pause } from "lucide-react";

// === Icon Components ===
const HomeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
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

const FlashIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
);

const NoteIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M3 5v14a2 2 0 002 2h14a2 2 0 002-2V8l-6-6H5a2 2 0 00-2 2zm14 14H7V7h7v5h5v7z" />
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

// === Main Application Wrapper (Updated) ===
export function ExecMindAgent({ onLogout }) {
    // --- All State is now managed here ---
    const [currentView, setCurrentView] = useState('dashboard');
    const [userName] = useState('Marc');

    // Master lists for shared data
    const [meetings, setMeetings] = useState([]);
    const [ideas, setIdeas] = useState([]);
    const [drafts, setDrafts] = useState([]);

    const [selectedDraftId, setSelectedDraftId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Fetch initial data when the app loads
    useEffect(() => {
        apiService.getMeetings().then(res => setMeetings(res.data));
        apiService.getIdeas().then(res => setIdeas(res.data));
        apiService.getNewsletters().then(res => setDrafts(res.data));
    }, []);

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

    // --- New handler to add a meeting to the central list ---
    const addMeeting = (newMeeting) => {
        setMeetings(prevMeetings => [newMeeting, ...prevMeetings]);
    };

    const addIdea = (newIdea) => {
        setIdeas(prevIdeas => [newIdea, ...prevIdeas]);
    }

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
            case 'quickCapture': return <QuickCapture onMeetingSaved={addMeeting} />;
            case 'fridayNotes': return <FridayNotesGenerator meetings={meetings} ideas={ideas} drafts={drafts} />;
            case 'viewDraft': return <ViewDraft draftId={selectedDraftId} onBack={() => setCurrentView('fridayNotes')} />;
            case 'searchResults': return <SearchResults query={searchQuery} results={searchResults} onViewDraft={handleViewDraft} />;
            case 'captureIdea': return <CaptureIdeaForm ideas={ideas} onIdeaSaved={addIdea} />;
            case 'exploreIdeas': return <IdeaSynthesizer />;
            case 'afterMeeting': return <AfterMeetingForm meetings={meetings} onMeetingSaved={addMeeting} />;
            case 'beforeMeeting': return <BeforeMeetingForm />;
            case 'documentAnalyzer': return <DocumentAnalyzer />;
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
                drafts={drafts}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
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

// --- Sidebar (Updated) ---
function Sidebar({ currentView, setCurrentView, onLogout, onViewDraft, drafts, isCollapsed, setIsCollapsed }) {
    // This component now receives drafts as a prop, no longer fetches its own data
    const shortcuts = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { id: 'quickCapture', label: 'Quick Capture', icon: <FlashIcon /> },
        { id: 'beforeMeeting', label: 'Meeting Insights', icon: <BriefingIcon /> },
        { id: 'fridayNotes', label: 'Friday Notes', icon: <NoteIcon /> },
        { id: 'captureIdea', label: 'Capture Idea', icon: <BulbIcon /> },
        { id: 'exploreIdeas', label: 'Explore Ideas', icon: <SearchIcon /> },
        { id: 'afterMeeting', label: 'Process Meeting', icon: <MeetingIcon /> },
        { id: 'documentAnalyzer', label: 'Doc Analysis', icon: <BookIcon /> },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div>
                <div className="sidebar-header">
                    <div className="brand-logo">EM</div>
                    <span className="brand-text">
                        <h2 className="brand-name">ExecMind</h2>
                        <div className="brand-edition">MarcMind Edition</div>
                    </span>
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
                                <span className="nav-label">{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-section">
                    <h3 className="sidebar-title">RECENT DRAFTS</h3>
                    <ul className="pending-actions-list">
                        {drafts.length > 0 ? (
                            drafts.slice(0, 4).map(draft => (
                                <li
                                    key={draft._id}
                                    className="pending-item"
                                    onClick={() => onViewDraft(draft._id)}
                                >
                                    <div className="pending-indicator"></div>
                                    <div className="pending-details">
                                        <div className="pending-title">{draft.title}</div>
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
                <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                    </svg>
                    <span className="nav-label">Collapse</span>
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
    const [userName] = useState('Marc'); // Assuming user's name is Marc

    // Date and Greeting Logic
    const date = new Date();
    const hour = date.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).replace(',', '');

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
            <div className="stats-grid dashboard-grid-override">
                {/* --- Top Left Greeting Card --- */}
                <div className="stat-card greeting-card">
                    <div className="greeting-text">
                        <h1>{greeting}, {userName}</h1>
                        <p>Your CEO command center for strategic leadership and operational excellence</p>
                    </div>
                    <div className="greeting-date">
                        <span>{formattedDate.split(' ')[0]}</span>
                        <span>{formattedDate.split(' ')[1]}</span>
                        <span>{formattedDate.split(' ')[2]}</span>
                    </div>
                </div>

                {/* --- Top Right Action Buttons --- */}
                <div className="dashboard-actions-card">
                    <button className="btn-secondary" onClick={handleGenerateInsights} disabled={isGenerating}>
                        {isGenerating ? <Loader /> : '✨'} Generate Weekly Insights
                    </button>
                    <button className="btn-primary" onClick={() => setCurrentView('fridayNotes')}>⚡ Generate Weekly Summary</button>
                </div>

                {/* --- Bottom Row Stat Cards --- */}
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
                    <h4><span style={{ verticalAlign: 'middle', marginRight: '8px' }}>🕒</span>This Week</h4>
                    <div className="stat-value">23</div>
                    <div className="stat-delta">Strategic Meetings</div>
                </div>
                <div className="stat-card">
                    <h4><span style={{ verticalAlign: 'middle', marginRight: '8px' }}>📈</span>Revenue Growth</h4>
                    <div className="stat-value" style={{ color: 'var(--accent-green)' }}>+18%</div>
                    <div className="stat-delta">QoQ</div>
                </div>
            </div>

            <div className="insights-feed">
                {isLoading && <p>Loading insights...</p>}
                {error && <div className="state-display error">{error}</div>}
                {!isLoading && !error && insights.length === 0 && (
                    <div className="state-display loading">
                        <span>💡</span> No insights found. Click "Generate Weekly Insights" to create them!
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

// --- FridayNotesGenerator (Updated) ---
function FridayNotesGenerator({ meetings, ideas }) {
    const [sources, setSources] = useState([]);
    const [isSourceLoading, setIsSourceLoading] = useState(false); // Set to false since data is passed as props
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
        // Combines the props to create the sources list
        const allSources = [
            ...meetings.map(m => ({ ...m, type: 'meeting', date: m.date })),
            ...ideas.map(i => ({ ...i, type: 'idea', date: i.createdAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        setSources(allSources);
    }, [meetings, ideas]); // Re-runs when the central lists are updated

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

    const handleExportToOutlook = () => {
        if (!result) return;

        const subject = result.title;
        let body = '';
        result.sections.forEach(section => {
            const content = section.content.replace(/<br \/>/g, '\n').replace(/<br\/>/g, '\n');
            body += `${section.title}\n`;
            body += '--------------------\n';
            body += `${content}\n\n`;
        });

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);

        const outlookUrl = `https://outlook.office.com/mail/`;
        window.open(outlookUrl, '_blank');
    };

    return (
        <div className="view-container full-width">
            <div className="dashboard-header">
                <h1>Generate "Friday Notes"</h1>
                <p>Select the key meetings, ideas, and insights from this week to synthesize into your newsletter.</p>
            </div>
            <div className="friday-notes-layout-container">
                {/* --- Left Column: Source Selection --- */}
                <div className="fn-sources-column">
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
                </div>
                {/* --- Right Column: Generation Form and Output --- */}
                <div className="fn-generation-column">
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

                    <StateDisplay isLoading={isLoading} error={error} />

                    {result && (
                        <div className="results-container newsletter-preview" style={{ marginTop: '24px' }}>
                            <div className="newsletter-header">
                                <h2>{result.title}</h2>
                                <button className="btn-secondary" onClick={handleExportToOutlook}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                                    </svg>
                                    Export to Outlook
                                </button>
                            </div>
                            {result.sections.map((section, index) => (
                                <div key={index} className="newsletter-section">
                                    <h4>{section.title}</h4>
                                    <p dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DocumentAnalyzer() {
    const [query, setQuery] = useState("Summarize Xerox’s Crum & Forster insurance venture");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isListening) stopListening();
        setIsLoading(true); setError(''); setAnalysisResult(null);
        try {
            const { data } = await apiService.analyzeDocument(query);
            setAnalysisResult(data);
        } catch (err) { setError(err.response?.data?.error || 'Failed to get analysis.'); }
        finally { setIsLoading(false); }
    };

    const handleExportToOutlook = () => {
        if (!analysisResult) return;

        const subject = `AI Analyst: Summary for "${query}"`;
        let body = `${analysisResult.summary}\n\n`;

        analysisResult.sections.forEach(section => {
            body += `${section.title}\n`;
            body += '--------------------\n';
            body += section.points.map(point => `- ${point}`).join('\n');
            body += '\n\n';
        });

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        const outlookUrl = `https://outlook.office.com/mail/`;
        window.open(outlookUrl, '_blank');
    };

    return (
        <div className="view-container">
            <div className="dashboard-header"><h1>AI Analyst</h1><p>Ask a question about your knowledge base.</p></div>
            <form onSubmit={handleSubmit} className="standard-form">
                <div className="form-group" style={{ position: 'relative' }}>
                    <label>Your Question</label>
                    <input type="text" className="form-textarea" value={query} onChange={(e) => setQuery(e.target.value)} />
                    <button type="button" className={`mic-button ${isListening ? 'listening' : ''}`} onClick={isListening ? stopListening : startListening}>🎤</button>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '🧠 Get Analysis'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} />
            {analysisResult && (
                <div className="results-container analysis-result">
                    <div className="newsletter-header">
                        <h2>Analysis Result</h2>
                        <button className="btn-secondary" onClick={handleExportToOutlook}>
                            <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                            </svg>
                            Export to Outlook
                        </button>
                    </div>
                    <p className="analysis-summary">{analysisResult.summary}</p>
                    {analysisResult.sections.map((section, index) => (
                        <div key={index} className="analysis-section">
                            <h4>{section.title}</h4>
                            <ul>
                                {section.points.map((point, pIndex) => (
                                    <li key={pIndex}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- AfterMeetingForm (Updated) ---
function AfterMeetingForm({ meetings, onMeetingSaved }) {
    const [formData, setFormData] = useState({ title: '', participants: '', meetingNotes: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        if (!isListening && transcript) {
            setFormData(prev => ({ ...prev, meetingNotes: prev.meetingNotes ? `${prev.meetingNotes} ${transcript}` : transcript }));
        }
    }, [transcript, isListening]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isListening) stopListening();
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const payload = { ...formData, date: new Date().toISOString(), participants: formData.participants.split(',').map(name => ({ name: name.trim() })) };
            const { data } = await apiService.createMeetingSummary(payload);
            setSuccessMessage('Meeting summarized successfully!');
            setFormData({ title: '', participants: '', meetingNotes: '' });
            onMeetingSaved(data); // <-- This updates the central list
        } catch (err) { setError(err.response?.data?.error || 'Failed to process summary.'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header"><h1>After the Meeting</h1><p>Process notes to create a concise, searchable summary.</p></div>
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
                    <button type="button" className={`mic-button ${isListening ? 'listening' : ''}`} onClick={isListening ? stopListening : startListening}>🎤</button>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '✨ Process Meeting'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />
            <div className="recent-ideas-container">
                <h3 className="sidebar-title">RECENTLY PROCESSED</h3>
                <div className="sources-list">{meetings.slice(0, 5).map(meeting => (
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
                ))}</div>
            </div>
        </div>
    );
}

// In frontend/src/ExecMindAgent.jsx

function BeforeMeetingForm() {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
    const { isSpeaking, speak, cancel } = useTextToSpeech();

    const formRef = useRef();

    // 🎤 Handle transcript auto-fill + auto-submit
    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
        if (!isListening && transcript.trim()) {
            if (formRef.current) {
                formRef.current.requestSubmit();
            }
        }
    }, [transcript, isListening]);

    // 📝 Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        cancel(); // stop previous narration
        setIsLoading(true);
        setError("");
        setAnswer(null);

        try {
            const { data } = await apiService.askAboutMeeting(query);
            setAnswer(data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.answer ||
                err.response?.data?.error ||
                "Failed to get an answer.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Helper: check if array has items
    const hasContent = (arr) => Array.isArray(arr) && arr.length > 0;

    // 🔊 Convert structured answer into a narration string
    const generateSpokenText = (briefing) => {
        if (!briefing) return "";

        let text = `Briefing on ${briefing.briefingTitle}. ${briefing.executiveSummary}. `;

        if (hasContent(briefing.actionPoints)) {
            text += "The key action points are: " + briefing.actionPoints.join(". ") + ". ";
        }
        if (hasContent(briefing.strategicQuestions)) {
            text +=
                "For the next meeting, consider these strategic questions: " +
                briefing.strategicQuestions.join(". ");
        }
        return text;
    };

    // 🎙️ Speak/Stop button handler
    const handleSpeakButtonClick = () => {
        if (isSpeaking) {
            cancel();
        } else if (answer) {
            const textToSpeak = generateSpokenText(answer);
            speak(textToSpeak);
        }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Meeting Insights</h1>
                <p>Ask the agent for a detailed briefing on any past meeting.</p>
            </div>

            {/* 🎤 Voice capture orb */}
            <div className="quick-capture-layout">
                <VoiceVisualizer
                    isListening={isListening}
                    onClick={isListening ? stopListening : startListening}
                />
            </div>

            {/* 📝 Question form */}
            <form ref={formRef} onSubmit={handleSubmit} className="standard-form" style={{ marginTop: "24px" }}>
                <div className="form-group">
                    {/* <label>Your Question</label> */}
                    <input
                        type="text"
                        className="form-textarea"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask the Agent for previous meeting Insights "
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading || !query.trim()}>
                    {isLoading ? <Loader /> : "Get Insights"}
                </button>
            </form>

            <StateDisplay isLoading={isLoading} error={error} />

            {/* 📊 Results */}
            {answer && (
                <div className="results-container briefing-card professional">
                    <div className="briefing-header">
                        <h2>{answer.briefingTitle}</h2>
                        <button className="btn-secondary speak-button" onClick={handleSpeakButtonClick}>
                            {isSpeaking ? <Pause /> : <Play />}
                        </button>
                    </div>

                    <p className="briefing-summary">{answer.executiveSummary}</p>

                    <div className="briefing-grid">
                        {hasContent(answer.quantitativeResults) && (
                            <div className="briefing-section">
                                <h3>Quantitative Results</h3>
                                {answer.quantitativeResults.map((item, index) => (
                                    <div className="metric-card" key={index}>
                                        <div className="metric-value">{item.value}</div>
                                        <div className="metric-label">{item.metric}</div>
                                        <div className="metric-context">{item.context}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {hasContent(answer.historicalData) && (
                            <div className="briefing-section">
                                <h3>Historical Data</h3>
                                <ul>
                                    {answer.historicalData.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {hasContent(answer.actionPoints) && (
                        <div className="briefing-section">
                            <h3>Action Points</h3>
                            <ul>
                                {answer.actionPoints.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {hasContent(answer.strategicQuestions) && (
                        <div className="briefing-section">
                            <h3>Strategic Questions</h3>
                            <ul>
                                {answer.strategicQuestions.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {hasContent(answer.directQuotes) && (
                        <div className="briefing-section">
                            <h3>Direct Quote</h3>
                            <blockquote className="briefing-quote">
                                "{answer.directQuotes[0]}"
                            </blockquote>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


// --- CaptureIdeaForm (Updated) ---
function CaptureIdeaForm({ ideas, onIdeaSaved }) {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        if (!isListening && transcript) {
            setContent(prev => prev ? `${prev} ${transcript}` : transcript);
        }
    }, [transcript, isListening]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) { setError("Idea content cannot be empty."); return; }
        if (isListening) stopListening();
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const payload = { content: content, source: 'text' };
            const { data } = await apiService.createIdea(payload);
            setSuccessMessage(`Idea captured! AI classified it under '${data.category}'.`);
            setContent('');
            onIdeaSaved(data); // <-- Updates the central list
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
                    {ideas.slice(0, 5).map(idea => (
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
function IdeaSynthesizer() {
    const [query, setQuery] = useState("What were my ideas about the financial market?");
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isListening) stopListening();
        setIsLoading(true); setError(''); setResult(null);
        try {
            const { data } = await apiService.synthesizeIdea(query);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to synthesize ideas.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Explore & Synthesize Ideas</h1>
                <p>Ask a question about a past idea to have the AI expand on it.</p>
            </div>
            <form onSubmit={handleSubmit} className="standard-form">
                <div className="form-group" style={{ position: 'relative' }}>
                    <label>What topic do you want to explore?</label>
                    <input type="text" className="form-textarea" value={query} onChange={(e) => setQuery(e.target.value)} />
                    <button type="button" className={`mic-button ${isListening ? 'listening' : ''}`} onClick={isListening ? stopListening : startListening}>🎤</button>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '💡 Synthesize Idea'}</button>
            </form>

            <StateDisplay isLoading={isLoading} error={error} />

            {result && (
                <div className="results-container analysis-result">
                    <h2>{result.title}</h2>
                    <p className="analysis-summary">{result.summary}</p>
                    <div className="analysis-section">
                        <h4>Proposed Next Steps</h4>
                        <ul>
                            {result.nextSteps.map((point, pIndex) => (
                                <li key={pIndex}>{point}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- QuickCapture (Updated) ---
function QuickCapture({ onMeetingSaved }) {
    const [rawText, setRawText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    // Create a ref for the form to trigger submission
    const formRef = useRef();

    useEffect(() => {
        // Update the textarea with the transcript as it comes in
        if (transcript) {
            setRawText(transcript);
        }

        // When listening stops and there's a transcript, automatically submit the form
        if (!isListening && transcript.trim()) {
            // Check if the form ref is attached before submitting
            if (formRef.current) {
                // Programmatically click the submit button
                formRef.current.requestSubmit();
            }
        }
    }, [transcript, isListening]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!rawText.trim()) {
            setError("Please provide a summary to process.");
            return;
        }
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const { data } = await apiService.quickCaptureMeeting(rawText);
            // This is the success message you liked, showing the title
            setSuccessMessage(`Successfully captured and saved meeting: "${data.title}"`);
            setRawText('');
            onMeetingSaved(data); // <-- This updates the central list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process the summary.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Quick Capture</h1>
                <p>Tap the orb to speak. The AI will automatically process and save your debrief when you're done.</p>
            </div>

            <div className="quick-capture-layout">
                <VoiceVisualizer
                    isListening={isListening}
                    onClick={isListening ? stopListening : startListening}
                />

                {/* The form and button are back, but submission is automatic */}
                <form ref={formRef} onSubmit={handleSubmit} className="standard-form" style={{ width: '100%' }}>
                    <div className="form-group">
                        {/* <label>Meeting Debrief Transcript</label> */}
                        <textarea
                            className="form-textarea"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Tap the orb to start speaking, or edit the transcript here..."
                            style={{ minHeight: '150px' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={isLoading || !rawText.trim()}>
                        {isLoading ? <Loader /> : 'Capture'}
                    </button>
                </form>
            </div>

            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />
        </div>
    );
}