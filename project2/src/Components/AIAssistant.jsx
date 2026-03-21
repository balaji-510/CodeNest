import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Lightbulb, Code2, Zap, BookOpen, HelpCircle } from "lucide-react";
import API_BASE from "../config";
import "../styles1/AIAssistant.css";

function AIAssistant({ code, language, problemTitle, problemDescription }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([
        { 
            role: "assistant", 
            content: "👋 Hi! I'm your AI Coding Assistant. I can help you with:\n\n• Explaining concepts and topics\n• Providing hints for problems\n• Analyzing time & space complexity\n• Debugging your code\n• Clearing any doubts\n\nHow can I help you today?" 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickActions = [
        { icon: <Lightbulb size={16} />, text: "Give me a hint", action: "hint" },
        { icon: <Code2 size={16} />, text: "Explain my code", action: "explain" },
        { icon: <Zap size={16} />, text: "Analyze complexity", action: "complexity" },
        { icon: <BookOpen size={16} />, text: "Explain the problem", action: "problem" }
    ];

    const handleQuickAction = (action) => {
        let prompt = "";
        switch (action) {
            case "hint":
                prompt = `Can you give me a hint for solving "${problemTitle}"? Don't give me the full solution, just guide me in the right direction.`;
                break;
            case "explain":
                prompt = `Can you explain what this code does and how it works?\n\n\`\`\`${language}\n${code}\n\`\`\``;
                break;
            case "complexity":
                prompt = `What is the time and space complexity of this code?\n\n\`\`\`${language}\n${code}\n\`\`\``;
                break;
            case "problem":
                prompt = `Can you explain the problem "${problemTitle}" in simpler terms and suggest an approach to solve it?`;
                break;
            default:
                return;
        }
        setQuery(prompt);
    };

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMessage = { role: "user", content: query };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setQuery("");
        setIsLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            
            // Prepare context for AI
            const context = {
                code: code || "",
                language: language || "javascript",
                problemTitle: problemTitle || "",
                problemDescription: problemDescription || "",
                conversationHistory: newMessages.slice(-5) // Last 5 messages for context
            };

            const response = await fetch(`${API_BASE}/api/ai-assistant/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    context: context
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages([...newMessages, {
                    role: "assistant",
                    content: data.response
                }]);
            } else {
                // Fallback to simulated response if API fails
                const simulatedResponse = generateSimulatedResponse(query, context);
                setMessages([...newMessages, {
                    role: "assistant",
                    content: simulatedResponse
                }]);
            }
        } catch (error) {
            console.error('AI Assistant error:', error);
            // Fallback to simulated response
            const context = {
                code: code || "",
                language: language || "javascript",
                problemTitle: problemTitle || ""
            };
            const simulatedResponse = generateSimulatedResponse(query, context);
            setMessages([...newMessages, {
                role: "assistant",
                content: simulatedResponse
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSimulatedResponse = (query, context) => {
        const lowerQuery = query.toLowerCase();
        
        // Hint request
        if (lowerQuery.includes('hint') || lowerQuery.includes('guide')) {
            return `💡 Here's a hint for "${context.problemTitle}":\n\n1. Start by understanding the input and output format\n2. Think about what data structure would be most efficient\n3. Consider if you've seen a similar pattern before\n4. Try to break down the problem into smaller steps\n\nWould you like me to explain a specific approach?`;
        }
        
        // Complexity analysis
        if (lowerQuery.includes('complexity') || lowerQuery.includes('time') || lowerQuery.includes('space')) {
            if (context.code) {
                return `⚡ Complexity Analysis:\n\n**Time Complexity:** O(n²)\n- You're using nested loops, which gives quadratic time\n\n**Space Complexity:** O(1)\n- Only using constant extra space\n\n**Optimization Suggestion:**\nConsider using a Hash Map to reduce time complexity to O(n). This would trade some space for better time performance.`;
            }
            return "Please share your code so I can analyze its complexity!";
        }
        
        // Code explanation
        if (lowerQuery.includes('explain') && context.code) {
            return `📝 Code Explanation:\n\nYour code is using a ${context.language} approach to solve the problem. Here's what it does:\n\n1. **Initialization:** Sets up variables and data structures\n2. **Main Logic:** Processes the input using loops/conditions\n3. **Return:** Provides the final result\n\n**Key Points:**\n- The algorithm iterates through the data\n- Uses conditional logic to make decisions\n- Returns the computed result\n\nWould you like me to explain any specific part in more detail?`;
        }
        
        // Problem explanation
        if (lowerQuery.includes('problem') || lowerQuery.includes('understand')) {
            return `📚 Problem Breakdown:\n\n**What the problem asks:**\nYou need to find a solution that meets the given constraints.\n\n**Approach:**\n1. Understand the input format\n2. Identify the pattern or algorithm needed\n3. Implement the solution step by step\n4. Test with examples\n\n**Common Approaches:**\n- Brute Force: Try all possibilities\n- Optimized: Use data structures like arrays, hash maps, or trees\n- Advanced: Dynamic programming or greedy algorithms\n\nWhat specific part would you like me to clarify?`;
        }
        
        // General help
        return `I'm here to help! I can assist you with:\n\n• **Hints:** Get guidance without spoilers\n• **Code Explanation:** Understand how your code works\n• **Complexity Analysis:** Learn about time and space complexity\n• **Concept Clarification:** Understand algorithms and data structures\n• **Debugging:** Find and fix issues in your code\n\nWhat would you like help with?`;
    };

    return (
        <>
            {!isOpen && (
                <button 
                    className="ai-toggle-btn" 
                    onClick={() => setIsOpen(true)}
                    title="AI Assistant"
                >
                    <Bot size={24} />
                </button>
            )}

            {isOpen && (
                <div className="ai-assistant">
                    <div className="ai-header">
                        <div className="ai-header-content">
                            <Bot size={24} />
                            <div>
                                <h3>AI Assistant</h3>
                                <span className="ai-status">Online</span>
                            </div>
                        </div>
                        <button 
                            className="ai-close-btn" 
                            onClick={() => setIsOpen(false)}
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="ai-quick-actions">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className="quick-action-btn"
                                onClick={() => handleQuickAction(action.action)}
                                title={action.text}
                            >
                                {action.icon}
                                <span>{action.text}</span>
                            </button>
                        ))}
                    </div>

                    <div className="ai-content">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.role}`}>
                                <div className="message-avatar">
                                    {msg.role === "assistant" ? <Bot size={20} /> : "👤"}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-avatar">
                                    <Bot size={20} />
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-footer">
                        <div className="ai-input-container">
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            />
                            <button 
                                className="ai-send-btn" 
                                onClick={handleSend}
                                disabled={!query.trim() || isLoading}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="ai-footer-hint">
                            <HelpCircle size={14} />
                            <span>Press Enter to send, Shift+Enter for new line</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AIAssistant;
