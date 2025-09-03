// frontend/src/ExecMindAgent.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ExecMindAgent.css';
import apiService from './apiService';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import VoiceVisualizer from './components/VoiceVisualizer';
import useTextToSpeech from './hooks/useTextToSpeech';
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

// === Icon Components ===
const IndexCardIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h16v2H4V6z" />
    </svg>
);


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
            <div className="dashboard-header" style={{ textAlign: 'center' }}>
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
            case 'liveDemo': return <LiveDemo />;
            case 'quickCapture': return <QuickCapture onMeetingSaved={addMeeting} />;
            case 'marcsIndexCards': return <MarcsIndexCards />;
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
                <img src="/Marc_image.jpg" alt="User Avatar" className="avatar-image" />
            </div>
        </header>
    );
}

// --- Sidebar (Updated) ---

function Sidebar({ currentView, setCurrentView, onLogout, onViewDraft, drafts, isCollapsed, setIsCollapsed }) {
    const shortcuts = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { id: 'liveDemo', label: 'Live Demo', icon: '🎙️' },
        { id: 'quickCapture', label: 'Quick Capture', icon: <FlashIcon /> },
        { id: 'marcsIndexCards', label: 'Index Cards', icon: <IndexCardIcon /> },
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
                {/* Header */}
                <div className="sidebar-header">
                    <div className="brand-logo">EM</div>
                    <div className="brand-text-wrapper">
                        <span className="brand-text">
                            <h2 className="brand-name">ExecMind</h2>
                            <div className="brand-edition">MarcMind Edition</div>
                        </span>
                    </div>
                    {/* Collapse Button (correct placement) */}
                    <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                        <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
                            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                        </svg>
                    </button>
                </div>

                {/* Shortcuts */}
                <div className="sidebar-section">
                    <h3 className="sidebar-title">SHORTCUTS</h3>
                    <ul className="nav-menu">
                        {shortcuts.map((item) => (
                            <li
                                key={item.id}
                                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                                onClick={() => setCurrentView(item.id)}
                                title={isCollapsed ? item.label : ''}
                            >
                                {item.icon}
                                <span className="nav-label">{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recent Drafts */}
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
                                            {new Date(draft.weekOf).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
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

            {/* Footer (Logout only) */}
            <div className="sidebar-footer">
                <div className="nav-item" onClick={onLogout} title={isCollapsed ? 'Logout' : ''}>
                    <svg viewBox="0 0 24 24" height="1em" width="1em" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 
                        1.1.9 2 2 2h8v-2H4V5z"></path>
                    </svg>
                    <span className="nav-label">Logout</span>
                </div>
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
    const [error, setError] = useState('');
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
    const { isSpeaking, speak, cancel } = useTextToSpeech();
    const formRef = useRef();

    // Auto-submit when speech ends
    useEffect(() => {
        if (transcript) setQuery(transcript);
        if (!isListening && transcript.trim()) {
            if (formRef.current) {
                formRef.current.requestSubmit();
            }
        }
    }, [transcript, isListening]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        cancel();
        setIsLoading(true);
        setError('');
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

    // Generate text for TTS
    const generateSpokenText = (briefing) => {
        if (!briefing) return "";
        let text = `${briefing.briefingTitle}. ${briefing.executiveSummary}. `;
        if (Array.isArray(briefing.actionItems) && briefing.actionItems.length > 0) {
            text += "Key Action Items include: ";
            briefing.actionItems.forEach((action) => {
                text += `${action.title}. ${action.details.join(". ")}. `;
            });
        }
        return text;
    };

    // Speak/stop summary
    const handleSpeakButtonClick = () => {
        if (isSpeaking) {
            cancel();
        } else {
            const textToSpeak = generateSpokenText(answer);
            speak(textToSpeak);
        }
    };

    // Utility: check array content
    const hasContent = (arr) => Array.isArray(arr) && arr.length > 0;

    return (
        <div className="view-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1>Meeting Insights</h1>
                <p>Ask the agent for a detailed briefing on any previous meeting.</p>
            </div>

            {/* Voice Capture */}
            <div className="quick-capture-layout">
                <VoiceVisualizer
                    isListening={isListening}
                    onClick={isListening ? stopListening : startListening}
                />
            </div>

            {/* Form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="standard-form"
                style={{ marginTop: "24px" }}
            >
                <div className="form-group">
                    <textarea
                        className="form-textarea equal-size"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tap the orb to speak, or type your question here..."
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading || !query.trim()}
                >
                    {isLoading ? <Loader /> : "Get Insights"}
                </button>
            </form>

            {/* State display */}
            <StateDisplay isLoading={isLoading} error={error} />

            {/* Answer display */}
            {answer && (
                <div className="results-container briefing-card professional">
                    <div className="briefing-header">
                        <h2>{answer.briefingTitle}</h2>
                        <button
                            className="btn-secondary speak-button"
                            onClick={handleSpeakButtonClick}
                        >
                            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            <span style={{ marginLeft: "8px" }}>
                                {isSpeaking ? "Stop Speaking" : "Speak Summary"}
                            </span>
                        </button>
                    </div>

                    <p className="briefing-summary">{answer.executiveSummary}</p>

                    {hasContent(answer.actionItems) && (
                        <div className="briefing-section">
                            <h3>✅ Action Items</h3>
                            {answer.actionItems.map((action, index) => (
                                <div key={index} className="action-item-group">
                                    <h4>{action.title}</h4>
                                    <ul>
                                        {action.details.map((detail, dIndex) => (
                                            <li key={dIndex}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
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
    const formRef = useRef();

    // ✅ ADDED STATE TO HOLD THE LIST OF RECENT MEETINGS
    const [recentMeetings, setRecentMeetings] = useState([]);

    // ✅ ADDED EFFECT TO FETCH MEETINGS ON LOAD
    useEffect(() => {
        const fetchRecentMeetings = async () => {
            try {
                const { data } = await apiService.getMeetings();
                setRecentMeetings(data);
            } catch (err) {
                console.error("Failed to fetch recent meetings for QuickCapture", err);
            }
        };
        fetchRecentMeetings();
    }, []);


    useEffect(() => {
        if (transcript) {
            setRawText(transcript);
        }
        if (!isListening && transcript.trim()) {
            if (formRef.current) {
                formRef.current.requestSubmit();
            }
        }
    }, [transcript, isListening]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rawText.trim()) {
            setError("Please provide a summary to process.");
            return;
        }
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const { data } = await apiService.quickCaptureMeeting(rawText);
            setSuccessMessage(`Successfully captured and saved meeting: "${data.title}"`);
            setRawText('');
            onMeetingSaved(data);
            // ✅ UPDATE THE LOCAL LIST INSTANTLY
            setRecentMeetings(prev => [data, ...prev]);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process the summary.');
        } finally {
            setIsLoading(false);
        }
    };

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Hi Marc, What's on your Mind ?</h1>
                <p></p>
            </div>

            <div className="quick-capture-layout">
                <VoiceVisualizer
                    isListening={isListening}
                    onClick={isListening ? stopListening : startListening}
                />
                <form ref={formRef} onSubmit={handleSubmit} className="standard-form" style={{ width: '100%' }}>
                    <div className="form-group">
                        <textarea
                            className="form-textarea equal-size"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Tap the orb to start speaking, or edit the transcript here..."
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={isLoading || !rawText.trim()}>
                        {isLoading ? <Loader /> : 'Capture'}
                    </button>
                </form>
            </div>

            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />

            {/* ✅ ADDED THIS ENTIRE "RECENTLY PROCESSED" SECTION */}
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
                                <p className="source-summary">{truncateText(meeting.summary, 120)}</p>
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


function LiveDemo() {
    // ✅ Re-added conversation state to store the AI's response
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [turnCounter, setTurnCounter] = useState(0);

    const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();
    const { isSpeaking, speak } = useTextToSpeech();
    const prevIsListening = useRef(false);

    // This effect handles submitting your voice input when you stop speaking
    useEffect(() => {
        if (prevIsListening.current && !isListening && transcript.trim()) {
            handleSubmit(transcript);
        }
        prevIsListening.current = isListening;
    }, [transcript, isListening]);

    // ✅ Corrected effect to speak the AI's response
    useEffect(() => {
        const lastMessage = conversation[conversation.length - 1];
        // Check if the last message is from the AI and not currently speaking
        if (lastMessage && lastMessage.sender === 'ai' && !isSpeaking) {
            speak(lastMessage.text);
        }
    }, [conversation]); // This effect now correctly depends on the conversation state

    const handleSubmit = async (prompt) => {
        if (!prompt.trim()) return;

        // We still add the user's prompt to the history for context, even if it's not displayed
        const userMessage = { sender: "user", text: prompt };
        setConversation((prev) => [...prev, userMessage]);

        setTranscript("");
        setIsLoading(true);
        try {
            const { data } = await apiService.getDemoResponse(turnCounter);

            // Add the AI's response to the conversation history, which triggers the speak effect
            const aiMessage = { sender: "ai", text: data.responseText };
            setConversation((prev) => [...prev, aiMessage]);

            setTurnCounter(prevTurn => prevTurn + 1);

        } catch (err) {
            console.error(err);
            const errorMessage = { sender: "ai", text: "Sorry, I encountered an error." };
            // Add error message to conversation to be spoken
            setConversation((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="view-container live-demo-container">
            <div className="dashboard-header">
                <h1>AI Executive Agent</h1>
            </div>

            <div className="live-demo-orb-wrapper">
                <VoiceVisualizer
                    isListening={isListening || isLoading || isSpeaking}
                    onClick={isListening ? stopListening : startListening}
                />
            </div>
        </div>
    );
}
// Add this new component to ExecMindAgent.jsx

function MarcsIndexCards() {
    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: '#f8fafc',
            minHeight: '100vh'
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px',
            padding: '40px 0'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1a202c',
            margin: '0 0 12px 0'
        },
        subtitle: {
            fontSize: '1.1rem',
            color: '#64748b',
            margin: 0
        },
        mainContainer: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
        },
        section: {
            marginBottom: '48px'
        },
        sectionTitle: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#64748b',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '24px'
        },
        cardRow: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '20px'
        },
        rowLabel: {
            fontSize: '1rem',
            fontWeight: '500',
            color: '#475569',
            minWidth: '80px'
        },
        pillsContainer: {
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
        },
        pill: {
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'white'
        },
        pillBlue: {
            backgroundColor: '#3b82f6',
        },
        pillGreen: {
            backgroundColor: '#10b981',
        },
        pillRed: {
            backgroundColor: '#ef4444',
        },
        noteItem: {
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '24px',
            transition: 'all 0.2s ease'
        },
        noteContent: {
            flex: 1
        },
        noteTitle: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1a202c',
            marginBottom: '8px'
        },
        noteSubtitle: {
            fontSize: '0.925rem',
            color: '#64748b',
            marginBottom: '4px',
            lineHeight: '1.4'
        },
        notePills: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'flex-start'
        },
        smallPill: {
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'white'
        }
    };

    const categories = [
        {
            label: 'General:',
            items: [
                { name: 'Techxchange', type: 'blue' },
                { name: 'Tandem', type: 'blue' },
                { name: 'Insurance', type: 'blue' },
                { name: 'HR', type: 'blue' },
                { name: 'AI', type: 'blue' }
            ]
        },
        {
            label: 'People:',
            items: [
                { name: 'John', type: 'green' },
                { name: 'Ken', type: 'green' },
                { name: 'Barbara', type: 'green' },
                { name: 'Arleen', type: 'green' },
                { name: 'Rajesh', type: 'green' }

            ]
        },
        {
            label: 'Meeting:',
            items: [
                { name: 'Dinner', type: 'red' },
                { name: 'Board', type: 'red' },
                { name: 'Strategy', type: 'red' }
            ]
        }
    ];

    const recentNotes = [
        {
            title: 'Discuss with Rajesh',
            subtitles: [
                'Ask Rajesh about Techxchange',
                'Confirm Dinner at Indian Restaurant',
                'Ask him about Tandem dates'
            ],
            tags: [
                { name: 'Rajesh', type: 'green' },
                { name: 'Dinner', type: 'red' },
                { name: 'Techxchange', type: 'blue' }
            ]
        },
        {
            title: 'Board meeting',
            subtitles: [
                'Finalise Strategic direction to be presented during board meeting'
            ],
            tags: [
                { name: 'Board', type: 'red' },
                { name: 'Strategy', type: 'red' }
            ]
        },
        {
            title: 'Meeting with Arleen',
            subtitles: [
                'Discuss Next quarter strategy and roadmap with Arleen'
            ],
            tags: [
                { name: 'Strategy', type: 'red' },
                { name: 'Arleen', type: 'green' }
            ]
        }
    ];

    const getPillStyle = (type, isSmall = false) => {
        const baseStyle = isSmall ? styles.smallPill : styles.pill;
        const colorStyle = type === 'blue' ? styles.pillBlue :
            type === 'green' ? styles.pillGreen :
                styles.pillRed;
        return { ...baseStyle, ...colorStyle };
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Marc's Index Cards</h1>
                <p style={styles.subtitle}>A visual canvas of categorized thoughts and recent notes.</p>
            </div>

            <div style={styles.mainContainer}>
                {/* Index Cards Section */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Marc's Index Cards</h3>

                    {categories.map((category, idx) => (
                        <div key={idx} style={styles.cardRow}>
                            <span style={styles.rowLabel}>{category.label}</span>
                            <div style={styles.pillsContainer}>
                                {category.items.map((item, itemIdx) => (
                                    <div
                                        key={itemIdx}
                                        style={getPillStyle(item.type)}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Notes Section */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Recent Ones</h3>

                    {recentNotes.map((note, idx) => (
                        <div
                            key={idx}
                            style={styles.noteItem}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f1f5f9';
                                e.target.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#f8fafc';
                                e.target.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div style={styles.noteContent}>
                                <div style={styles.noteTitle}>{note.title}</div>
                                {note.subtitles.map((subtitle, subIdx) => (
                                    <div key={subIdx} style={styles.noteSubtitle}>
                                        {subtitle}
                                    </div>
                                ))}
                            </div>
                            <div style={styles.notePills}>
                                {note.tags.map((tag, tagIdx) => (
                                    <div
                                        key={tagIdx}
                                        style={getPillStyle(tag.type, true)}
                                    >
                                        {tag.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
