// This file is for augmenting global types.

// global 'window' object
// may have these non-standard properties.
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}