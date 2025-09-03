import { useState, useEffect, useRef } from 'react';

const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef(window.speechSynthesis);
    const voicesRef = useRef([]);

    const loadVoices = () => {
        voicesRef.current = synthRef.current.getVoices();
    };

    useEffect(() => {
        loadVoices();
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
        }
        return () => {
            if (synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const speak = (text) => {
        const synth = synthRef.current;
        if (synth.speaking || !text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const preferredMaleVoices = [
            "Microsoft David - English (United States)",
            "Alex",
            "Google US English"
        ];
        let selectedVoice = voicesRef.current.find(voice => preferredMaleVoices.includes(voice.name));
        if (!selectedVoice) {
            selectedVoice = voicesRef.current.find(voice => voice.lang === 'en-US');
        }

        utterance.voice = selectedVoice;
        utterance.pitch = 0.9;
        utterance.rate = 0.95;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            console.error('Browser speech synthesis error:', event);
            setIsSpeaking(false);
        };
        synth.speak(utterance);
        setIsSpeaking(true);
    };

    const cancel = () => {
        synthRef.current.cancel();
        setIsSpeaking(false);
    };

    return { isSpeaking, speak, cancel };
};

export default useTextToSpeech;