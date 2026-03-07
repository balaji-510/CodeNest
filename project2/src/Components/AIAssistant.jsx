import { useState } from "react";
import "../styles1/AIAssistant.css";

// eslint-disable-next-line no-unused-vars
function AIAssistant({ code, language }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I'm your AI Coding Assistant. Paste your error or ask me to explain your code!" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!query.trim()) return;

        const newMessages = [...messages, { role: "user", content: query }];
        setMessages(newMessages);
        setQuery("");
        setIsLoading(true);

        // Simulate AI response for now
        setTimeout(() => {
            setMessages([...newMessages, {
                role: "assistant",
                content: "I've analyzed your code. It looks like you're trying to solve the problem using a nested loop. While this works, a Hash Map would be more efficient for O(n) time complexity."
            }]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <>
            {!isOpen && (
                <button className="ai-toggle-btn" onClick={() => setIsOpen(true)}>
                    🤖
                </button>
            )}

            {isOpen && (
                <div className="ai-assistant">
                    <div className="ai-header">
                        <h3>🤖 AI Assistant</h3>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', color: 'white', fontSize: '1.2rem' }}>×</button>
                    </div>
                    <div className="ai-content">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.role}`}>
                                <p><strong>{msg.role === "assistant" ? "AI: " : "You: "}</strong>{msg.content}</p>
                            </div>
                        ))}
                        {isLoading && <p className="loading">AI is thinking...</p>}
                    </div>
                    <div className="ai-footer">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default AIAssistant;
