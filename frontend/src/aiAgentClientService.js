/**
 * AI Agent Client Service
 * Calls backend proxy instead of NVIDIA API directly to avoid CORS issues
 */

const API_BASE = 'http://localhost:5000/api/ai-agent'; // Backend proxy endpoint (absolute URL)

export const initializeAIAgent = (apiKey, userRole = 'teacher', systemContext = {}) => {
  // Note: apiKey is not used here since backend handles it
  console.log('🤖 Initializing AI Agent (using backend proxy)');

  const SYSTEM_PROMPT = `You are an intelligent AI Assistant for Gradify, an AI-powered exam grading system.

USER ROLE: ${userRole}
SYSTEM CONTEXT:
- Total Students: ${systemContext?.totalStudents || 0}
- Total Exams Graded: ${systemContext?.totalExams || 0}
- Active Subjects: ${systemContext?.subjects || 0}

YOUR CAPABILITIES:
1. Answer questions about the exam system
2. Provide guidance on grading exams
3. Help manage students and subjects
4. Generate insights from exam data
5. Provide study tips and feedback suggestions
6. Explain grading criteria

IMPORTANT RULES:
- Be friendly, supportive, and educational
- Respond in the same language as the user
- Keep responses concise but helpful (2-4 sentences)
- For exam-related queries, provide clear, actionable advice
- Always maintain student privacy and academic integrity`;

  return {
    /**
     * Process user message via backend proxy
     */
    chat: async (userMessage) => {
      try {
        console.log('📮 Sending message via backend:', userMessage.substring(0, 50) + '...');

        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            maxTokens: 500,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            error: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(error.error || response.statusText);
        }

        const result = await response.json();
        console.log(`✅ Response received from: ${result.model}`);

        if (!result.success) {
          throw new Error(result.error || 'Unknown error');
        }

        const assistantMessage = result.data.choices?.[0]?.message?.content || '';

        // Try to parse action if it exists
        let action = null;
        let explanation = assistantMessage;

        try {
          const jsonMatch = assistantMessage.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
          if (jsonMatch) {
            action = JSON.parse(jsonMatch[0]);
            explanation = assistantMessage.replace(jsonMatch[0], '').trim();
          }
        } catch (e) {
          // Not an action, just a regular response
        }

        return {
          success: true,
          response: assistantMessage,
          action,
          explanation,
          source: result.usingFallback ? 'llama-3.1-fallback' : 'kimi-k2.5',
          model: result.model,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('❌ AI Agent Failed:', error.message);
        return {
          success: false,
          response: `⚠️ API Error: ${error.message}`,
          error: error.message,
          source: 'error',
        };
      }
    },

    /**
     * Suggest helpful tips based on user context
     */
    getSuggestions: async (context) => {
      try {
        const prompt = `Based on this context in an exam grading system, suggest 3 helpful actions or tips:\n\nContext: ${context}\n\nProvide as JSON array: [{"suggestion":"...", "icon":"📌"}, ...]`;

        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            maxTokens: 300,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        const text = result.data.choices?.[0]?.message?.content || '[]';
        const jsonMatch = text.match(/\[[\s\S]*?\]/);
        const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        return { success: true, suggestions };
      } catch (error) {
        console.error('❌ Suggestions failed:', error);
        return {
          success: false,
          suggestions: [
            { suggestion: 'Upload a student exam for grading', icon: '📤' },
            { suggestion: 'Check recent exam results', icon: '📊' },
            { suggestion: 'Manage your students and subjects', icon: '👥' },
          ],
        };
      }
    },

    /**
     * Generate a helpful response for a specific action
     */
    getActionHelp: async (action) => {
      try {
        const prompt = `In an exam grading system, explain how to ${action}. Provide step-by-step guidance in 2-3 sentences.`;

        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            maxTokens: 250,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        const help = result.data.choices?.[0]?.message?.content || '';
        return { success: true, help };
      } catch (error) {
        console.error('❌ Help generation failed:', error);
        return { success: false, help: 'Unable to generate help at this time.' };
      }
    },

    /**
     * Smart command interpreter
     */
    interpretCommand: async (command) => {
      try {
        const commandPrompt = `User issued this command in an exam system: "${command}"\n\nReturn JSON: {"type":"action|question|info","intent":"...","confidence":0.7,"suggestedAction":"..."}`;

        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: commandPrompt }],
            temperature: 0.4,
            maxTokens: 200,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        const text = result.data.choices?.[0]?.message?.content || '{}';
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        const interpretation = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        return { success: true, ...interpretation };
      } catch (error) {
        console.error('❌ Command interpretation failed:', error);
        return { success: false, type: 'unknown' };
      }
    },
  };
};

export default initializeAIAgent;
