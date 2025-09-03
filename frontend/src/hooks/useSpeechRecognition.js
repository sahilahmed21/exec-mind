import { useState, useEffect, useRef } from 'react';

const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            console.error("This browser doesn't support speech recognition.");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        // --- KEY CHANGES HERE ---
        recognition.continuous = true; // Allows you to speak continuously
        recognition.interimResults = true; // Provides interim results as you speak

        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                // We concatenate all parts of the transcript
                finalTranscript += event.results[i][0].transcript;
            }
            setTranscript(finalTranscript);
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => console.error('Speech recognition error:', event.error);
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, transcript, startListening, stopListening, setTranscript };
};

export default useSpeechRecognition;