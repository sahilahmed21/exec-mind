import { useState, useEffect, useRef } from 'react';

const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef(window.speechSynthesis);
    const voicesRef = useRef([]);

    // Function to load voices
    const loadVoices = () => {
        voicesRef.current = synthRef.current.getVoices();
    };

    useEffect(() => {
        loadVoices();
        // Voices are often loaded asynchronously, so we need to listen for the event
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
        }

        // Cleanup on component unmount
        return () => {
            if (synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const speak = (text) => {
        const synth = synthRef.current;
        if (synth.speaking) {
            console.error('SpeechSynthesis is already speaking.');
            return;
        }
        if (text !== '') {
            const utterance = new SpeechSynthesisUtterance(text);

            // --- Voice Selection Logic (Updated for Windows Female Voices) ---
            const preferredVoices = [
                // Prioritize high-quality female voices
                "Microsoft Zira - English (United States)", // Windows 10/11 Female
                "Microsoft Jessa - English (United States)", // Another Windows Female option
                "Google US English", // Common on Chrome/Android (Female)
                "Samantha",          // Common on Apple devices (Female)
                "Microsoft David - English (United States)" // Male fallback for Windows
            ];

            let selectedVoice = voicesRef.current.find(voice => preferredVoices.includes(voice.name));
            // Fallback to the first available US English voice if preferred are not found
            if (!selectedVoice) {
                selectedVoice = voicesRef.current.find(voice => voice.lang === 'en-US');
            }
            utterance.voice = selectedVoice;

            // --- Cadence and Pitch Adjustment ---
            utterance.pitch = 1;     // From 0 to 2 (1 is default)
            utterance.rate = 1;   // From 0.1 to 10 (0.95 is slightly slower and more natural)
            utterance.volume = 0.5;    // From 0 to 1

            utterance.onend = () => {
                setIsSpeaking(false);
            };
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                setIsSpeaking(false);
            };

            synth.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const cancel = () => {
        synthRef.current.cancel();
        setIsSpeaking(false);
    };

    return {
        isSpeaking,
        speak,
        cancel,
    };
};

export default useTextToSpeech;
