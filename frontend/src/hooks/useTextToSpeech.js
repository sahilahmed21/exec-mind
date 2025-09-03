import { useState, useEffect, useRef } from 'react';
import apiService from '../apiService';

const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const voicesRef = useRef([]);

    // Function to load available system voices
    const loadVoices = () => {
        voicesRef.current = synthRef.current.getVoices();
    };

    useEffect(() => {
        loadVoices();
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
        }

        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const speak = async (text) => {
        if (isSpeaking || !text) return;

        // First, cancel any browser-based speech that might be stuck
        synthRef.current.cancel();

        setIsSpeaking(true);
        try {
            // Using our high-quality OpenAI TTS backend
            const { data: audioBlob } = await apiService.generateSpeech(text);
            const audioUrl = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const newAudio = new Audio(audioUrl);
            audioRef.current = newAudio;

            newAudio.play();
            newAudio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };
        } catch (error) {
            console.error('Failed to play speech via API, falling back to browser voice.', error);
            // --- Fallback to browser voice if API fails ---
            speakWithBrowserVoice(text);
        }
    };

    const speakWithBrowserVoice = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);

        // --- Voice Selection Logic for MALE voice ---
        const preferredMaleVoices = [
            "Microsoft David - English (United States)", // Windows
            "Alex", // macOS
            "Google US English" // Try this on Chrome, might be male
        ];

        let selectedVoice = voicesRef.current.find(voice => preferredMaleVoices.includes(voice.name));

        // If no preferred voices found, search for any US English male voice
        if (!selectedVoice) {
            selectedVoice = voicesRef.current.find(voice => voice.lang === 'en-US' && voice.name.toLowerCase().includes('male'));
        }
        // Final fallback
        if (!selectedVoice) {
            selectedVoice = voicesRef.current.find(voice => voice.lang === 'en-US');
        }

        utterance.voice = selectedVoice;
        utterance.pitch = 0.9; // Lower pitch slightly for a more natural male tone
        utterance.rate = 0.95;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            console.error('Browser speech synthesis error:', event);
            setIsSpeaking(false);
        };

        synthRef.current.speak(utterance);
    }

    const cancel = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        synthRef.current.cancel();
        setIsSpeaking(false);
    };

    return { isSpeaking, speak, cancel };
};

export default useTextToSpeech;