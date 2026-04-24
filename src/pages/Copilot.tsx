import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotApi } from '../services/api';
import {
    Send,
    Bot,
    User,
    Sparkles,
    RefreshCw,
    Copy,
    Check,
    Lightbulb,
    BookOpen,
    Wrench,
    DollarSign,
    Settings,
    X,
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: string[];
}

interface QuickSuggestion {
    icon: 'dfm' | 'gdt' | 'cost' | 'tips';
    label: string;
    prompt: string;
}

const Copilot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [apiUrl, setApiUrl] = useState('http://localhost:8000/api/v1/chatbot/chat');
    const [showSettings, setShowSettings] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [quickSuggestions, setQuickSuggestions] = useState<QuickSuggestion[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const iconMap = {
        dfm: Wrench,
        gdt: BookOpen,
        cost: DollarSign,
        tips: Lightbulb,
    };

    useEffect(() => {
        loadCopilotContent();
        checkBackendConnection();
    }, []);

    const loadCopilotContent = async () => {
        try {
            const [pageData, quickData] = await Promise.all([
                chatbotApi.pageContent('copilot', { timestamp: new Date().toISOString() }),
                chatbotApi.quickSuggestions(),
            ]);

            const aiContent = pageData?.content || {};
            const welcomeText = typeof aiContent.welcome === 'string' ? aiContent.welcome : 'CADGuard AI Copilot is ready.';
            const welcomeSuggestions = Array.isArray(aiContent.quickSuggestions)
                ? aiContent.quickSuggestions.map((item: any) => String(item.prompt || '')).filter(Boolean).slice(0, 4)
                : [];

            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: welcomeText,
                    timestamp: new Date(),
                    suggestions: welcomeSuggestions,
                },
            ]);

            const contentCards = Array.isArray(aiContent.quickSuggestions) ? aiContent.quickSuggestions : [];
            const normalizedCards: QuickSuggestion[] = contentCards
                .map((item: any) => ({
                    icon: ['dfm', 'gdt', 'cost', 'tips'].includes(String(item.icon)) ? item.icon : 'tips',
                    label: String(item.label || 'Suggestion'),
                    prompt: String(item.prompt || ''),
                }))
                .filter((item: QuickSuggestion) => Boolean(item.prompt));

            if (normalizedCards.length > 0) {
                setQuickSuggestions(normalizedCards.slice(0, 4));
            } else if (Array.isArray(quickData?.suggestions)) {
                const fallbackCards: QuickSuggestion[] = quickData.suggestions.slice(0, 4)
                    .map((group, index) => ({
                        icon: (['dfm', 'gdt', 'cost', 'tips'][index] as QuickSuggestion['icon']) || 'tips',
                        label: String(group.category || 'Suggestion'),
                        prompt: String(group.prompts?.[0] || ''),
                    }))
                    .filter((item: QuickSuggestion) => Boolean(item.prompt));
                setQuickSuggestions(fallbackCards);
            } else {
                setQuickSuggestions([]);
            }

            setConnectionStatus('connected');
        } catch (error) {
            setConnectionStatus('error');
            setMessages([
                {
                    id: 'welcome-error',
                    role: 'assistant',
                    content: 'Unable to load AI-generated copilot content. Verify backend and Groq configuration.',
                    timestamp: new Date(),
                    suggestions: [],
                },
            ]);
            setQuickSuggestions([]);
        }
    };

    const checkBackendConnection = async () => {
        try {
            const response = await fetch('http://localhost:8000/health', {
                method: 'GET',
            });
            if (response.ok) {
                setConnectionStatus('connected');
            } else {
                setConnectionStatus('error');
            }
        } catch (error) {
            setConnectionStatus('error');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare messages for API - only send last 10 messages for context
            const recentMessages = messages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...recentMessages, { role: 'user', content: text }],
                    context: 'CAD Design Validation',
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || data.message || 'I received your message but could not generate a response.',
                timestamp: new Date(),
                suggestions: data.suggestions || [],
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setConnectionStatus('connected');
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `⚠️ **Connection Error**

I'm unable to connect to the backend server. Please ensure:

1. **Backend is running**: Start the backend with \`cd backend && python main.py\`
2. **Server is on port 8000**: The API should be at http://localhost:8000
3. **Grok API key is set**: Ensure GROK_API_KEY is in your .env file

**Error details**: ${error instanceof Error ? error.message : 'Unknown error'}

Would you like to try again?`,
                timestamp: new Date(),
                suggestions: ['Retry connection', 'Check backend status'],
            };
            setMessages((prev) => [...prev, errorMessage]);
            setConnectionStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const clearChat = () => {
        loadCopilotContent();
    };

    const renderMessage = (message: Message) => {
        const isUser = message.role === 'user';

        return (
            <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                    {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
                    <div className={`inline-block p-4 rounded-2xl ${isUser
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                        : 'bg-gray-800/50 border border-white/5'
                        }`}>
                        <div className={`prose prose-invert max-w-none ${isUser ? 'text-left' : ''}`}>
                            {formatMessage(message.content)}
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : ''}`}>
                        <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                        {!isUser && (
                            <button
                                onClick={() => copyToClipboard(message.content, message.id)}
                                className="text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {copiedId === message.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                    {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(suggestion)}
                                    className="px-3 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-700 rounded-full text-gray-300 hover:text-white transition-all border border-white/5 hover:border-cyan-500/30"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const formatMessage = (content: string) => {
        const lines = content.split('\n');
        return lines.map((line, i) => {
            // Headers
            if (line.startsWith('# ')) {
                return <h1 key={i} className="text-xl font-bold text-white mb-2">{line.slice(2)}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={i} className="text-lg font-semibold text-white mb-2 mt-3">{line.slice(3)}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={i} className="text-base font-semibold text-cyan-400 mb-1 mt-2">{line.slice(4)}</h3>;
            }
            // Bold text
            if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold text-cyan-400 my-1">{line.slice(2, -2)}</p>;
            }
            // List items
            if (line.startsWith('- ')) {
                const text = line.slice(2);
                // Check for bold within list item
                const parts = text.split(/\*\*(.*?)\*\*/);
                return (
                    <li key={i} className="text-gray-300 ml-4 list-disc">
                        {parts.map((part, j) =>
                            j % 2 === 1 ? <strong key={j} className="text-cyan-400">{part}</strong> : part
                        )}
                    </li>
                );
            }
            // Numbered list
            if (/^\d+\.\s/.test(line)) {
                return <li key={i} className="text-gray-300 ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
            }
            // Warning/alert
            if (line.startsWith('⚠️')) {
                return <p key={i} className="text-yellow-400 my-2">{line}</p>;
            }
            // Empty line
            if (line.trim() === '') {
                return <br key={i} />;
            }
            // Regular text with inline bold
            const parts = line.split(/\*\*(.*?)\*\*/);
            if (parts.length > 1) {
                return (
                    <p key={i} className="text-gray-300 mb-1">
                        {parts.map((part, j) =>
                            j % 2 === 1 ? <strong key={j} className="text-cyan-400">{part}</strong> : part
                        )}
                    </p>
                );
            }
            return <p key={i} className="text-gray-300 mb-1">{line}</p>;
        });
    };

    return (
        <div className="h-screen bg-[#0B0F1A] flex flex-col">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative bg-gray-800/50 border-b border-white/5 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50"></div>
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">AI Copilot</h1>
                            <p className="text-sm text-gray-400">Powered by Grok AI</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${connectionStatus === 'connected'
                            ? 'bg-green-500/20'
                            : connectionStatus === 'error'
                                ? 'bg-red-500/20'
                                : 'bg-yellow-500/20'
                            }`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${connectionStatus === 'connected'
                                ? 'bg-green-400'
                                : connectionStatus === 'error'
                                    ? 'bg-red-400'
                                    : 'bg-yellow-400'
                                }`}></div>
                            <span className={`text-xs ${connectionStatus === 'connected'
                                ? 'text-green-400'
                                : connectionStatus === 'error'
                                    ? 'text-red-400'
                                    : 'text-yellow-400'
                                }`}>
                                {connectionStatus === 'connected'
                                    ? 'Connected'
                                    : connectionStatus === 'error'
                                        ? 'Disconnected'
                                        : 'Checking...'}
                            </span>
                        </div>
                        <button
                            onClick={() => checkBackendConnection()}
                            className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Check connection"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={clearChat}
                            className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Clear chat"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-white/5"
                        >
                            <label className="block text-sm text-gray-400 mb-2">API Endpoint</label>
                            <input
                                type="text"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                className="w-full bg-gray-700/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Actions */}
            <div className="relative px-6 py-3 border-b border-white/5 bg-gray-800/30">
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {quickSuggestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(suggestion.prompt)}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-all border border-white/5 hover:border-cyan-500/30 whitespace-nowrap disabled:opacity-50"
                        >
                            {React.createElement(iconMap[suggestion.icon] || Lightbulb, { className: 'w-4 h-4 text-cyan-400' })}
                            {suggestion.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="relative flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <AnimatePresence>
                    {messages.map(renderMessage)}
                </AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-gray-800/50 border border-white/5 rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <span className="text-gray-400 text-sm ml-2">Thinking with Grok AI...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative px-6 py-4 border-t border-white/5 bg-gray-800/30">
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about DFM, tolerances, materials, or any CAD design question..."
                            className="w-full bg-gray-800/50 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                            rows={1}
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Press Enter to send, Shift+Enter for new line • Powered by Grok AI
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Copilot;