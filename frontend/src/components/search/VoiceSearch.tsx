
import React, { useState, useEffect, useCallback } from 'react';
import { Mic, X } from 'lucide-react';
import { VoiceSearchProps } from './types';

// Define the Web Speech API types
interface SpeechRecognitionEvent {
  data: {
    results: Array<{
      transcript: string;
    }>;
  };
}

interface SpeechRecognitionErrorEvent {
  error: Error;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'end', listener: (event: Event) => void): void;
  removeEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  removeEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  removeEventListener(type: 'end', listener: (event: Event) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
  }
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onTranscript,
  onError
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check for standard SpeechRecognition first, then prefixed version
    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in your browser');
      onError('Speech recognition is not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // Event listener for successful recognition
    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      // Access results via event.data based on original code structure
      const result = event.data?.results?.[0]?.transcript;
      if (!result) {
        console.warn('Voice search result was empty.');
        return;
      }
      setTranscript(result);
      setIsListening(false);
      onTranscript(result);
    });

    // Event listener for errors
    recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      onError(event.error);
    });

    // Event listener for when recognition ends
    recognition.addEventListener('end', () => {
      setIsListening(false);
    });

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, onTranscript, onError]);

  // Start listening
  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setIsListening(true);
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Voice Search</h2>
          <button
            onClick={stopListening}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-4 rounded-full ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-primary text-white'
                }`}
                title={isListening ? 'Stop Listening' : 'Start Listening'}
              >
                <Mic className="h-8 w-8" />
              </button>
            </div>

            {transcript && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Transcript:</h3>
                <p className="text-gray-600">{transcript}</p>
              </div>
            )}

            {isListening && (
              <div className="text-center text-gray-500">
                Listening... Speak now
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 