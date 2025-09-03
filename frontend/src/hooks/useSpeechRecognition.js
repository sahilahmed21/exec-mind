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
        recognition.continuous = false; // Set to false for single utterances
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const finalTranscript = event.results[0][0].transcript;
            setTranscript(finalTranscript.trim());
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