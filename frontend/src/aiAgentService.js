/**
 * AI Agent Service - Dual Model Support
 * Primary: Kimi K2.5  
 * Fallback: Meta Llama 3.1 (if Kimi unavailable)
 */

const NVIDIA_API_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const PRIMARY_MODEL = 'moonshotai/kimi-k2.5';
const FALLBACK_MODEL = 'meta/llama-3.1-405b-instruct';

/**
 * Send request with automatic model fallback
 */
const callAIModel = async (apiKey, messages, temperature = 0.7, maxTokens = 500) => {
  // Try primary model first
  try {
    console.log(`🤖 Trying: ${PRIMARY_MODEL}`);
    const response = await fetch(NVIDIA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Primary failed (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Success with ${PRIMARY_MODEL}`);
    return { data, model: PRIMARY_MODEL };
  } catch (primaryError) {
    console.warn(`⚠️  Trying fallback...`, primaryError.message);

    // Try fallback model
    try {
      console.log(`🤖 Trying: ${FALLBACK_MODEL}`);
      const response = await fetch(NVIDIA_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Fallback failed (${response.status}): ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Success with ${FALLBACK_MODEL} (fallback)`);
      return { data, model: FALLBACK_MODEL, usingFallback: true };
    } catch (fallbackError) {
      throw new Error(`Both models failed: Primary(${primaryError.message}) | Fallback(${fallbackError.message})`);
    }
  }
};

export const initializeAIAgent = (apiKey, userRole = 'teacher', systemContext = {}) => {
  if (!apiKey || !apiKey.trim()) {
    console.warn('⚠️ NVIDIA API key not configured. AI Agent disabled.');
    return null;
  }

  // System prompt that understands exam system operations
  const SYSTEM_PROMPT = `You are an intelligent AI Assistant for Gradify, an AI-powered exam grading system.

USER ROLE: ${userRole}
AVAILABLE ACTIONS: ${JSON.stringify(Object.keys(systemContext || {}), null, 2)}

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
- If user asks to do something outside your capability, explain what you CAN do
- Always maintain student privacy and academic integrity

SYSTEM CONTEXT:
- Total Students: ${systemContext?.totalStudents || 0}
- Total Exams Graded: ${systemContext?.totalExams || 0}
- Active Subjects: ${systemContext?.subjects || 0}

When user requests an ACTION (like "upload exam", "grade answer", "show stats"), respond with:
{"action":"ACTION_NAME","params":{"param1":"value1"},"explanation":"What this will do"}

When user asks a QUESTION, respond naturally and helpfully.`;

  return {
    /**
     * Process user message and return response + possible actions
     */
    chat: async (userMessage) => {
      try {
        console.log('📮 Sending message:', userMessage.substring(0, 50) + '...');
        
        const { data, model, usingFallback } = await callAIModel(
          apiKey,
          [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          0.7,
          500
        );

        const assistantMessage = data.choices?.[0]?.message?.content || '';
        console.log('✅ Response received from:', model);

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
          source: usingFallback ? 'llama-3.1-fallback' : 'kimi-k2.5',
          model: model,
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
      const prompt = `Based on this context in an exam grading system, suggest 3 helpful actions or tips:\n\nContext: ${context}\n\nProvide as JSON array: [{"suggestion":"...", "icon":"📌"}, ...]`;

      try {
        const { data } = await callAIModel(apiKey, [{ role: 'user', content: prompt }], 0.6, 300);
        const text = data.choices?.[0]?.message?.content || '[]';
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
      const prompt = `In an exam grading system, explain how to ${action}. Provide step-by-step guidance in 2-3 sentences.`;

      try {
        const { data } = await callAIModel(apiKey, [{ role: 'user', content: prompt }], 0.6, 250);
        const help = data.choices?.[0]?.message?.content || '';
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
      const commandPrompt = `User issued this command in an exam system: "${command}"\n\nReturn JSON: {"type":"action|question|info","intent":"...","confidence":0.7,"suggestedAction":"..."}`;

      try {
        const { data } = await callAIModel(apiKey, [{ role: 'user', content: commandPrompt }], 0.4, 200);
        const text = data.choices?.[0]?.message?.content || '{}';
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
