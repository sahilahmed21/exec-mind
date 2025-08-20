// src/ExecMindAgent.jsx
import React, { useState } from 'react';
import './ExecMindAgent.css';
import apiService from './apiService';

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

// === Main Application Wrapper ===
export function ExecMindAgent({ onLogout }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [userName] = useState('Marc');

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard setCurrentView={setCurrentView} />;
            case 'fridayNotes':
                return <FridayNotesGenerator />;
            case 'afterMeeting':
                return <AfterMeetingForm />;
            case 'beforeMeeting':
                return <BeforeMeetingForm />;
            case 'captureIdea':
                return <CaptureIdeaForm />;
            case 'sendExcerpt':
                return <SendExcerptForm />;
            default:
                return <Dashboard setCurrentView={setCurrentView} />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onLogout={onLogout}
            />
            <div className="main-wrapper">
                <Header userName={userName} />
                <main className="content-area">{renderView()}</main>
            </div>
        </div>
    );
}

// === Layout Components ===
function Header({ userName }) {
    return (
        <header className="main-header">
            <div className="search-bar">
                <span className="search-icon">
                    <SearchIcon />
                </span>
                <input
                    type="text"
                    placeholder={`Ask ExecMind anything, ${userName}...`}
                />
            </div>
            <div className="header-actions">
                <button className="header-icon-btn">🔔</button>
                <div className="user-avatar">{userName.charAt(0)}</div>
            </div>
        </header>
    );
}

function Sidebar({ currentView, setCurrentView, onLogout }) {
    const shortcuts = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { id: 'fridayNotes', label: 'Friday Notes', icon: '📝' },
        { id: 'captureIdea', label: 'Capture Idea', icon: <BulbIcon /> },
        { id: 'afterMeeting', label: 'Process Meeting', icon: <MeetingIcon /> },
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
                                className={`nav-item ${currentView === item.id ? 'active' : ''
                                    }`}
                                onClick={() => setCurrentView(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="sidebar-section">
                    <h3 className="sidebar-title">PENDING ACTIONS</h3>
                    <ul className="pending-actions-list">
                        <li
                            className="pending-item"
                            onClick={() => setCurrentView('beforeMeeting')}
                        >
                            <div className="pending-indicator high-priority"></div>
                            <div className="pending-details">
                                <div className="pending-title">
                                    Follow up with Sarah on Q4 budget
                                </div>
                                <div className="pending-meta">Due in 2 hours</div>
                            </div>
                        </li>
                        <li className="pending-item">
                            <div className="pending-indicator"></div>
                            <div className="pending-details">
                                <div className="pending-title">Review board presentation</div>
                                <div className="pending-meta">Due tomorrow</div>
                            </div>
                        </li>
                        <li className="pending-item">
                            <div className="pending-indicator low-priority"></div>
                            <div className="pending-details">
                                <div className="pending-title">Send book excerpt to team</div>
                                <div className="pending-meta">Due Friday</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="sidebar-footer">
                <button className="logout-button" onClick={onLogout}>
                    <svg
                        viewBox="0 0 24 24"
                        height="1em"
                        width="1em"
                        fill="currentColor"
                    >
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
    return (
        <div className="view-container">
            <div className="dashboard-header">
                <div>
                    <h1>Friday Notes & Insights</h1>
                    <p>AI-curated strategic insights and trending topics</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">📖 Reading List</button>
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
                <div className="insight-card">
                    <div className="insight-content">
                        <h3>The Rise of Emotional AI in Enterprise Software<span className="badge">High Relevance</span></h3>
                        <p>How companies are integrating emotional intelligence into their digital products to improve customer experience and employee satisfaction.</p>
                        <div className="insight-meta">
                            <span className="tag blue">Technology Trends</span>
                            <span>8 min read</span>
                            <span>Source: Harvard Business Review</span>
                        </div>
                        <div className="key-insights">
                            <h4>Key Insights</h4>
                            <ul>
                                <li>40% increase in customer satisfaction when emotional AI is implemented.</li>
                                <li>Key applications in customer service and HR management.</li>
                                <li>Ethical considerations and privacy implications.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="insight-actions">
                        <button className="header-icon-btn">🔄</button>
                        <button className="header-icon-btn">🔗</button>
                    </div>
                </div>
                <div className="insight-card">
                    <div className="insight-content">
                        <h3>Strategic Leadership in Times of Uncertainty<span className="badge">High Relevance</span></h3>
                        <p>Essential frameworks for C-suite navigating market volatility and leading through ambiguous business environments.</p>
                        <div className="insight-meta">
                            <span className="tag purple">Leadership</span>
                            <span>12 min read</span>
                            <span>Source: McKinsey Insights</span>
                        </div>
                        <div className="key-insights">
                            <h4>Key Insights</h4>
                            <ul>
                                <li>Adaptive leadership models for rapid decision-making.</li>
                                <li>Building organizational resilience through uncertainty.</li>
                                <li>Communication strategies for maintaining team confidence.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="insight-actions">
                        <button className="header-icon-btn">🔄</button>
                        <button className="header-icon-btn">🔗</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FridayNotesGenerator() {
    // NOTE: Replace this mock data with a useEffect hook to fetch from your backend.
    const mockSources = [
        { _id: 'm1', type: 'meeting', title: 'Q4 Strategy Session', summary: 'Discussed new market expansion and product roadmap updates for 2026.' },
        { _id: 'i1', type: 'idea', content: 'Host a company-wide innovation challenge next quarter.' },
        { _id: 'm2', type: 'meeting', title: 'Project Phoenix Sync', summary: 'Aligned on frontend architecture and confirmed timeline for beta launch.' },
        { _id: 'i2', type: 'idea', content: 'Explore strategic partnership with Acme Corp.' },
        { _id: 'i3', type: 'idea', content: 'Implement a new CRM to streamline sales process.' },
    ];

    const [sources] = useState(mockSources);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [manualInputs, setManualInputs] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Generate "Friday Notes"</h1>
                <p>Select the key meetings and ideas from this week to synthesize into your newsletter.</p>
            </div>
            <div className="friday-notes-container">
                <h3>Select Sources for this Week's Notes</h3>
                <div className="sources-list">
                    {sources.map(source => (
                        <div key={source._id} className={`source-item ${selectedIds.has(source._id) ? 'selected' : ''}`} onClick={() => toggleSelection(source._id)}>
                            <div className={`type-indicator ${source.type}`}></div>
                            <div className="source-details">
                                <div className="source-header">
                                    <span className="source-type">{source.type === 'meeting' ? 'Meeting' : 'Idea'}</span>
                                    {source.title && <span className="source-title">{source.title}</span>}
                                </div>
                                <p className="source-summary">{source.summary || source.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="generation-form">
                    <div className="form-group">
                        <label htmlFor="manualInputs">Any additional notes or themes?</label>
                        <textarea id="manualInputs" className="form-textarea" value={manualInputs} onChange={(e) => setManualInputs(e.target.value)} placeholder="e.g., Shout-out to the tech team for the portal launch..." />
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

// === Other Form Components (Styled for consistency) ===

function AfterMeetingForm() {
    const [formData, setFormData] = useState({ title: '', participants: '', meetingNotes: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const payload = { ...formData, participants: formData.participants.split(',').map(name => ({ name: name.trim() })) };
            await apiService.createMeetingSummary(payload);
            setSuccessMessage('Meeting summarized successfully!');
            setFormData({ title: '', participants: '', meetingNotes: '' });
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
                <div className="form-group">
                    <label>Meeting Notes or Transcript</label>
                    <textarea value={formData.meetingNotes} onChange={(e) => setFormData({ ...formData, meetingNotes: e.target.value })} required />
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '✨ Process Meeting'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />
        </div>
    );
}

function BeforeMeetingForm() {
    // ... Existing BeforeMeetingForm logic ...
    // This component's internal logic is fine.
    // The new CSS will style it correctly.
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
    // ... Existing CaptureIdeaForm logic ...
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) { setError("Idea content cannot be empty."); return; }
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const payload = { content: content, source: 'text' };
            const { data } = await apiService.createIdea(payload);
            setSuccessMessage(`Idea captured! AI classified it under '${data.category}'.`);
            setContent('');
        } catch (err) { setError(err.response?.data?.error || 'Failed to capture idea.'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Capture an Idea</h1>
                <p>Jot down a thought, and the agent will save it.</p>
            </div>
            <form onSubmit={handleSubmit} className="standard-form">
                <div className="form-group">
                    <label>What's on your mind?</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '💡 Capture Idea'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />
        </div>
    );
}

function SendExcerptForm() {
    // ... Existing SendExcerptForm logic ...
    const [formData, setFormData] = useState({ query: '', recipient: '', context: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setSuccessMessage('');
        try {
            const { data } = await apiService.sendBookExcerpt(formData);
            setSuccessMessage(data.message);
        } catch (err) { setError(err.response?.data?.error || 'Failed to send excerpt.'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="view-container">
            <div className="dashboard-header">
                <h1>Send Book Excerpt</h1>
                <p>Instantly find and email a relevant passage.</p>
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
                <div className="form-group">
                    <label>Context for the email (optional)</label>
                    <textarea name="context" value={formData.context} onChange={handleChange} />
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader /> : '✉️ Find & Send'}</button>
            </form>
            <StateDisplay isLoading={isLoading} error={error} successMessage={successMessage} />
        </div>
    );
}