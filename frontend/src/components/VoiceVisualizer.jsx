import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import voiceWaveAnimation from '../animations/voice-wave.json';

const VoiceVisualizer = ({ isListening, onClick }) => {
    const lottieRef = useRef();

    useEffect(() => {
        if (lottieRef.current) {
            if (isListening) {
                lottieRef.current.play();
            } else {
                lottieRef.current.stop();
            }
        }
    }, [isListening]);

    return (
        <div
            className={`voice-visualizer-container ${isListening ? 'listening' : ''}`}
            onClick={onClick}
        >
            <Lottie
                lottieRef={lottieRef}
                animationData={voiceWaveAnimation}
                loop={true}
                autoplay={false}
                style={{ height: 150, width: 150 }}
            />
            <div className="voice-visualizer-label">
                {isListening ? 'Listening...' : 'Tap to Speak'}
            </div>
        </div>
    );
};

export default VoiceVisualizer;