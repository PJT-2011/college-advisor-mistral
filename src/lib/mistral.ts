/**
 * AI Service using Local LLM (LM Studio or Ollama)
 * 
 * Provides text generation capabilities for the college advisor chatbot.
 * Uses local Mistral-Instruct model via OpenAI-compatible API.
 */

interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

class MistralService {
  private apiUrl: string;
  private model: string;

  constructor() {
    // Local LLM endpoint (LM Studio default port)
    this.apiUrl = process.env.LOCAL_LLM_URL || 'http://localhost:1234/v1/chat/completions';
    this.model = 'mistralai/mistral-7b-instruct-v0.3'; // Model name in LM Studio
  }

  /**
   * Generate text completion using local LLM
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 1024; // Increased from 300 to 1024

    try {
      // Build messages array for chat completion
      const messages: Array<{ role: string; content: string }> = [];
      
      // Combine system prompt and user message for better compatibility
      let userMessage = prompt;
      if (options.systemPrompt) {
        userMessage = `${options.systemPrompt}\n\n${prompt}`;
      }
      
      messages.push({ role: 'user', content: userMessage });

      // Call local LLM with OpenAI-compatible API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LM Studio error response:', errorText);
        throw new Error(`Local LLM request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      return content?.trim() || this.getFallbackResponse(prompt);
    } catch (error) {
      console.error('Local LLM error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  /**
   * Generate with streaming (not supported by HF Inference, returns full response)
   */
  async *generateStream(
    prompt: string, 
    options: GenerateOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const response = await this.generate(prompt, options);
    yield response;
  }

  /**
   * Chat completion (manages conversation history)
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    options: GenerateOptions = {}
  ): Promise<string> {
    // Format messages into chat format
    let prompt = '';
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        options.systemPrompt = msg.content;
      } else if (msg.role === 'user') {
        prompt += `${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `${msg.content}\n`;
      }
    }

    return this.generate(prompt, options);
  }

  /**
   * Classify text into categories (for intent detection)
   */
  async classify(
    text: string,
    categories: string[],
    systemPrompt?: string
  ): Promise<string> {
    const classificationPrompt = `Classify the following text into ONLY ONE of these categories: ${categories.join(', ')}

Text: "${text}"

Reply with ONLY the category name, nothing else.`;

    try {
      const result = await this.generate(classificationPrompt, {
        systemPrompt: systemPrompt || 'You are a text classifier.',
        temperature: 0.3,
        maxTokens: 20,
      });

      // Clean up and validate result
      const cleaned = result.trim().toLowerCase();
      const match = categories.find(cat => cleaned.includes(cat.toLowerCase()));
      
      return match || categories[categories.length - 1];
    } catch (error) {
      console.error('Classification error:', error);
      return categories[categories.length - 1]; // Return last category as fallback
    }
  }

  /**
   * Extract structured data from text
   */
  async extract(
    text: string,
    schema: string,
    systemPrompt?: string
  ): Promise<string> {
    const extractionPrompt = `Extract information from the following text according to this schema:
${schema}

Text: "${text}"

Output only valid JSON:`;

    return this.generate(extractionPrompt, {
      systemPrompt: systemPrompt || 'You are a data extraction assistant. Output only valid JSON.',
      temperature: 0.2,
      maxTokens: 300,
    });
  }

  /**
   * Get fallback response when API fails
   */
  private getFallbackResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('study') || lowerPrompt.includes('exam')) {
      return "I recommend creating a study schedule, breaking down material into manageable chunks, and using active recall techniques like practice problems and self-quizzing. Would you like specific study tips for your subject?";
    }
    
    if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety')) {
      return "It's normal to feel stressed sometimes. Try deep breathing exercises, take regular breaks, and make sure you're getting enough sleep. Consider talking to a campus counselor if stress becomes overwhelming.";
    }
    
    if (lowerPrompt.includes('friend') || lowerPrompt.includes('social')) {
      return "Making friends in college takes time! Join clubs related to your interests, attend campus events, and don't be afraid to start conversations in class. Quality friendships develop naturally.";
    }
    
    return "I'm here to help with academic advice, wellness support, or campus life questions. Could you tell me more about what you need help with?";
  }

  /**
   * Health check
   */
  isReady(): boolean {
    return true; // Always ready with HuggingFace API
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      model: this.model,
      provider: 'Local LLM (LM Studio/Ollama)',
      endpoint: this.apiUrl,
      isReady: this.isReady(),
    };
  }
}

// Singleton instance
let mistralInstance: MistralService | null = null;

export function getMistralService(): MistralService {
  if (!mistralInstance) {
    mistralInstance = new MistralService();
  }
  return mistralInstance;
}

export default MistralService;
