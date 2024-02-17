import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import './App.css'; // Import the CSS file

// Video Input Component
const VideoInput = ({ videoUrl, setVideoUrl }) => (
  <input
    type="text"
    placeholder="YouTube Video URL"
    value={videoUrl}
    onChange={(e) => setVideoUrl(e.target.value)}
  />
);

// Prompt Input Component
const PromptInput = ({ prompt, setPrompt }) => (
  <input
    type="text"
    placeholder="Enter your summarization prompt"
    value={prompt}
    onChange={(e) => setPrompt(e.target.value)}
  />
);

// Submit Button Component
const SubmitButton = ({ loading }) => (
  <button type="submit" disabled={loading}>
    Submit
  </button>
);

// Loading Message Component
const LoadingMessage = ({ loading }) => loading && <p>Loading...</p>;

// ErrorMessage Component
const ErrorMessage = ({ error }) => error && <p>{error}</p>;

// YouTube Player Component
const YouTubePlayer = ({ videoId }) => <YouTube videoId={videoId} />;

// Summary Component
const Summary = React.forwardRef(({ transcriptLoaded, summary }, ref) =>
  transcriptLoaded && (
    <div className="summary" ref={ref}>
      <p>{summary}</p>
    </div>
  )
);

// Main App Component
function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [transcriptLoaded, setTranscriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [prompt, setPrompt] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const summaryRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const videoId = getVideoIdFromUrl(videoUrl);
    setVideoId(videoId);
    setFormSubmitted(true);
  };

  const getVideoIdFromUrl = (url) => {
    const regex = /[?&]v=([^&]+)/i;
    return url.match(regex)[1];
  };

  useEffect(() => {
    const fetchTranscript = async () => {
      if (videoId) {
        setLoading(true);
        setError('');
        try {
          const response = await fetch('/fetchTranscript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId }),
          });
          const data = await response.json();

          setTranscript(data.items[0].snippet.description);
        } catch (err) {
          setError('Error fetching transcript');
        } finally {
          setLoading(false);
          setTranscriptLoaded(true);
        }
      }
    };

    fetchTranscript();
  }, [videoId]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (transcriptLoaded && formSubmitted) {
        setLoading(true);
        setError('');
        try {
          const response = await fetch('/fetchSummary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript, prompt }),
          });
          const data = await response.json();

          setSummary(data);
          summaryRef.current.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
          setError('Error fetching summary');
        } finally {
          setLoading(false);
          setFormSubmitted(false);
        }
      }
    };

    fetchSummary();
  }, [transcriptLoaded, formSubmitted, transcript, prompt]);

  return (
    <div className="app">
      <h1>YouTube Summarizer</h1>
      <form onSubmit={handleSubmit}>
        <VideoInput videoUrl={videoUrl} setVideoUrl={setVideoUrl} />
        <PromptInput prompt={prompt} setPrompt={setPrompt} />
        <SubmitButton loading={loading} />
      </form>

      <LoadingMessage loading={loading} />
      <ErrorMessage error={error} />
      <YouTubePlayer videoId={videoId} />
      <Summary transcriptLoaded={transcriptLoaded} summary={summary} ref={summaryRef} />
    </div>
  );
}

export default App;