import { useRef, useEffect, useState } from "react";
import { X, Send, Loader2, Bot, Paperclip, XCircle, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMoviAgent } from "@/hooks/useMoviAgent";
import { cn } from "@/lib/utils";

// TypeScript interfaces for the Web Speech API
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface MoviChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
}

export function MoviChat({ isOpen, onClose, currentPage }: MoviChatProps) {
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  // The hook handles all state management and API calls.
  const { messages, isLoading, sendMessage } = useMoviAgent(
    [{ role: "assistant", content: "👋 Hi! I'm Movi. How can I help?" }],
    isTtsEnabled
  );
  
  const [input, setInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // This function is clean and only calls the hook. No fetch here.
  const handleSend = () => {
    if (!input.trim() && !uploadedImage) return;
    sendMessage(input, currentPage, uploadedImage);
    setInput("");
    setUploadedImage(null);
  };

  // The rest of the handler functions are correct and do not need changes.
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setUploadedImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };
  const handleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!SpeechRecognition) { alert("Speech recognition is not supported in this browser."); return; }
      const recognition: ISpeechRecognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setInput(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => { console.error("Speech recognition error:", event.error); setIsListening(false); };
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };
  useEffect(() => { if (isListening) { return () => { recognitionRef.current?.stop(); }; } }, [isListening]);


  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[600px] flex flex-col shadow-2xl">
        {/* Header with audio controls */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2"><Bot className="w-6 h-6" /><div><h3 className="font-semibold">Movi</h3><p className="text-xs opacity-90 capitalize">Context: {currentPage.replace(/([A-Z])/g, ' $1').trim()}</p></div></div>
            <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => setIsTtsEnabled(!isTtsEnabled)} className="hover:bg-primary-dark text-primary-foreground">{isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-primary-dark text-primary-foreground"><X className="w-5 h-5" /></Button>
            </div>
        </div>

        {/* Messages display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg ${ message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {message.image && <img src={message.image} alt="Upload" className="rounded-t-lg" />}
                {message.content && <p className="text-sm whitespace-pre-wrap p-3">{message.content}</p>}
              </div>
            </div>
          ))}
          {isLoading && <div className="flex justify-start"><div className="bg-muted rounded-lg p-3"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div></div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t">
          {uploadedImage && <div className="relative mb-2 w-fit"><img src={uploadedImage} alt="Preview" className="w-16 h-16 rounded-md border p-1 object-cover" /><Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted hover:bg-destructive" onClick={() => setUploadedImage(null)}><XCircle className="w-4 h-4" /></Button></div>}
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading}><Paperclip className="w-4 h-4" /></Button>
            <Input placeholder={isListening ? "Listening..." : "Ask me anything..."} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} className="flex-1" />
            <Button variant="ghost" size="icon" onClick={handleListen} disabled={isLoading} className={cn(isListening && "text-destructive animate-pulse")}>{isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</Button>
            <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !uploadedImage)} size="icon"><Send className="w-4 h-4" /></Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">💡 Try uploading a screenshot or using the mic.</p>
        </div>
      </Card>
    </div>
  );
}