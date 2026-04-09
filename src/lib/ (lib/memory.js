// Persistent conversation memory with vector search capability
class AetherMemory {
  constructor() {
    this.conversations = new Map();
    this.shortTerm = []; // Last 10 messages
    this.longTerm = []; // Summarized important points
    this.maxShortTerm = 10;
  }
  
  addMessage(role, content, conversationId = 'default') {
    const message = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date(),
      embedding: null // For semantic search
    };
    
    this.shortTerm.push(message);
    if (this.shortTerm.length > this.maxShortTerm) {
      const old = this.shortTerm.shift();
      this.summarizeAndStore(old);
    }
    
    // Store in conversation history
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }
    this.conversations.get(conversationId).push(message);
    
    return message;
  }
  
  summarizeAndStore(message) {
    // In production, use actual summarization API
    if (message.content.length > 100) {
      this.longTerm.push({
        ...message,
        summary: message.content.substring(0, 100) + '...',
        importance: this.calculateImportance(message)
      });
    }
  }
  
  calculateImportance(message) {
    // Simple heuristic for importance
    const importantKeywords = ['remember', 'important', 'note', 'save', 'key'];
    return importantKeywords.some(kw => 
      message.content.toLowerCase().includes(kw)
    ) ? 1 : 0.5;
  }
  
  getContext(windowSize = 5) {
    const recent = this.shortTerm.slice(-windowSize);
    const relevant = this.findRelevant(recent[0]?.content);
    
    return {
      recent,
      relevant: relevant.slice(0, 3),
      summary: this.generateSummary()
    };
  }
  
  findRelevant(query) {
    // Simple keyword matching (replace with vector similarity in production)
    if (!query) return [];
    return this.longTerm.filter(m => 
      m.content.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  generateSummary() {
    if (this.longTerm.length === 0) return null;
    return `Previous context: ${this.longTerm.slice(-3).map(m => m.summary).join('; ')}`;
  }
  
  exportConversation(conversationId) {
    const conv = this.conversations.get(conversationId);
    if (!conv) return null;
    
    return {
      id: conversationId,
      messages: conv,
      exportedAt: new Date().toISOString(),
      stats: {
        messageCount: conv.length,
        startTime: conv[0]?.timestamp,
        endTime: conv[conv.length - 1]?.timestamp
      }
    };
  }
  
  clear() {
    this.shortTerm = [];
    this.longTerm = [];
  }
}

export const memory = new AetherMemory();
