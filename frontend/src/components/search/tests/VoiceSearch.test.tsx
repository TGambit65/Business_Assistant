import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { VoiceSearch } from '../VoiceSearch';

// Define types for the mock SpeechRecognition
interface MockSpeechRecognitionEvent extends Event {
  results: {
    0: {
      0: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  }[];
  error?: string;
}

interface MockSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: jest.Mock;
  stop: jest.Mock;
  abort: jest.Mock;
  onresult?: (event: MockSpeechRecognitionEvent) => void;
  onerror?: (event: MockSpeechRecognitionEvent) => void;
  onend?: () => void;
  // Explicitly add EventTarget methods if needed by the implementation
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  dispatchEvent: jest.Mock;
}

describe('VoiceSearch', () => {
  let mockOnTranscript: jest.Mock;
  let mockOnError: jest.Mock;
  let mockRecognitionInstance: MockSpeechRecognition;
  let originalSpeechRecognition: any;
  let mockStart: jest.Mock;
  let mockStop: jest.Mock;
  let mockAbort: jest.Mock;
  let mockAddEventListener: jest.Mock;
  let mockRemoveEventListener: jest.Mock;

  beforeEach(() => {
    mockOnTranscript = jest.fn();
    mockOnError = jest.fn();

    // Create mock instance methods first
    mockStart = jest.fn();
    mockStop = jest.fn();
    mockAbort = jest.fn();
    mockAddEventListener = jest.fn();
    mockRemoveEventListener = jest.fn();

    // Create a mock instance object implementing the interface
    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: 'en-US',
      start: mockStart,
      stop: mockStop,
      abort: mockAbort,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(), // Dummy dispatchEvent
    } as unknown as MockSpeechRecognition; // Cast to the interface

    // Store original if it exists
    originalSpeechRecognition = window.SpeechRecognition;

    // Mock the Web Speech API constructor
    window.SpeechRecognition = jest.fn(() => mockRecognitionInstance) as any;
  });

  afterEach(() => {
    // Restore original SpeechRecognition
    window.SpeechRecognition = originalSpeechRecognition;
    jest.clearAllMocks();
  });

  it('renders voice search button', () => {
    render(
      <VoiceSearch
        onTranscript={mockOnTranscript}
        onError={mockOnError}
      />
    );
    // The button inside the modal has title "Start Listening"
    expect(screen.getByTitle('Start Listening')).toBeInTheDocument();
  });

  it('starts recognition on button click', () => {
    render(
      <VoiceSearch
        onTranscript={mockOnTranscript}
        onError={mockOnError}
      />
    );
    const button = screen.getByTitle('Start Listening');
    fireEvent.click(button);
    expect(mockRecognitionInstance.start).toHaveBeenCalled();
    expect(button).toHaveClass('recording'); // Check for recording state style
  });

  it('stops recognition on button click while recording', () => {
    render(
      <VoiceSearch
        onTranscript={mockOnTranscript}
        onError={mockOnError}
      />
    );
    const button = screen.getByTitle('Start Listening');
    fireEvent.click(button); // Start
    fireEvent.click(button); // Stop
    expect(mockRecognitionInstance.stop).toHaveBeenCalled();
    expect(button).not.toHaveClass('recording');
  });

  it('calls onTranscript with final result', async () => {
    render(
      <VoiceSearch
        onTranscript={mockOnTranscript}
        onError={mockOnError}
      />
    );
    const button = screen.getByTitle('Start Listening');
    fireEvent.click(button);

    // Simulate speech recognition result
    act(() => {
      const event = new Event('result') as MockSpeechRecognitionEvent;
      event.results = [[{ 0: { transcript: 'hello world', confidence: 0.9 }, isFinal: true }]];
      // Find the listener attached for 'result' and call it
      const resultListener = mockAddEventListener.mock.calls.find(call => call[0] === 'result')?.[1];
      if (resultListener) {
        resultListener(event);
      }
    });

    await waitFor(() => {
      expect(mockOnTranscript).toHaveBeenCalledWith('hello world');
    });
    expect(button).not.toHaveClass('recording'); // Should stop after final result
  });

  it('handles recognition error', async () => {
    render(
      <VoiceSearch
        onTranscript={mockOnTranscript}
        onError={mockOnError}
      />
    );
    const button = screen.getByTitle('Start Listening');
    fireEvent.click(button);

    // Simulate speech recognition error
    act(() => {
      const event = new Event('error') as MockSpeechRecognitionEvent;
      event.error = 'network';
       // Find the listener attached for 'error' and call it
       const errorListener = mockAddEventListener.mock.calls.find(call => call[0] === 'error')?.[1];
       if (errorListener) {
         errorListener(event);
       }
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('network');
    });
    expect(button).not.toHaveClass('recording'); // Should stop after error
  });

  it('handles unsupported browser', () => {
    // Temporarily remove the mock for this test
    const tempOriginal = window.SpeechRecognition;
    delete (window as any).SpeechRecognition; 

    render(
      <VoiceSearch
        onTranscript={mockOnTranscript}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/speech recognition is not supported/i)).toBeInTheDocument();
    expect(screen.queryByTitle('Start Listening')).not.toBeInTheDocument(); // Button shouldn't render

    // Restore mock
    window.SpeechRecognition = tempOriginal;
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <VoiceSearch
        onTranscript={mockOnTranscript}
        onError={mockOnError}
      />
    );
    const button = screen.getByTitle('Start Listening');
    fireEvent.click(button); // Start recognition to attach listeners

    unmount();

    // Check if removeEventListener was called on the instance
    expect(mockRemoveEventListener).toHaveBeenCalledWith('result', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('end', expect.any(Function));
  });

  it('updates button state during recording', () => {
     render(
      <VoiceSearch
        onTranscript={mockOnTranscript}
        onError={mockOnError}
      />
    );

    const button = screen.getByTitle('Start Listening');
    fireEvent.click(button);

    expect(button).toHaveClass('recording');
    expect(button).toHaveAttribute('title', 'Stop Listening');

    // Simulate end event
     act(() => {
       // Find the listener attached for 'end' and call it
       const endListener = mockAddEventListener.mock.calls.find(call => call[0] === 'end')?.[1];
       if (endListener) {
         endListener();
       }
     });

    expect(button).not.toHaveClass('recording');
    expect(button).toHaveAttribute('title', 'Start Listening');
  });

});