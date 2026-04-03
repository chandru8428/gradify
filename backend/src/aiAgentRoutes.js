/**
 * AI Agent API Proxy Routes
 * Handles all NVIDIA Kimi K2.5 API calls server-side to avoid CORS issues
 */

import express from 'express';

const router = express.Router();

const NVIDIA_API_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const PRIMARY_MODEL = 'moonshotai/kimi-k2.5';
const FALLBACK_MODEL = 'meta/llama-3.1-405b-instruct';

/**
 * POST /api/ai-agent/chat
 * Proxy chat request to NVIDIA API
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, temperature = 0.7, maxTokens = 500 } = req.body;
    const nvidiaApiKey = process.env.NVIDIA_API_KEY;

    if (!nvidiaApiKey) {
      return res.status(400).json({
        success: false,
        error: 'NVIDIA_API_KEY not configured in server',
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'messages array required',
      });
    }

    console.log(`🤖 [Server] Trying: ${PRIMARY_MODEL}`);

    // Helper function to make request with timeout
    const fetchWithTimeout = async (url, options, timeoutMs = 30000) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        return await fetch(url, { ...options, signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
    };

    // Try primary model first
    let response;
    try {
      response = await fetchWithTimeout(NVIDIA_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nvidiaApiKey.trim()}`,
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
    } catch (error) {
      console.warn(`⚠️  [Server] Primary model failed: ${error.message}`);
      response = null;
    }

    // If primary failed, try fallback model
    if (!response || !response.ok) {
      console.log(`📌 [Server] Attempting fallback: ${FALLBACK_MODEL}`);
      
      try {
        response = await fetchWithTimeout(NVIDIA_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${nvidiaApiKey.trim()}`,
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
      } catch (error) {
        console.error(`❌ [Server] Fallback model error: ${error.message}`);
        throw new Error(`All models failed: ${error.message}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Fallback model failed with status ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [Server] Success with ${FALLBACK_MODEL} (fallback)`);
      return res.json({
        success: true,
        data,
        model: FALLBACK_MODEL,
        usingFallback: true,
      });
    }

    // Primary model succeeded
    const data = await response.json();
    console.log(`✅ [Server] Success with ${PRIMARY_MODEL}`);
    return res.json({
      success: true,
      data,
      model: PRIMARY_MODEL,
    });
  } catch (error) {
    console.error('❌ [Server] AI Agent Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/feedback
 * Generate exam feedback via Kimi K2.5
 */
router.post('/feedback', async (req, res) => {
  try {
    const { subject, studentAnswer, questionText, marksAwarded, maxMarks } = req.body;
    const nvidiaApiKey = process.env.NVIDIA_API_KEY;

    if (!nvidiaApiKey) {
      return res.status(400).json({ success: false, error: 'API key not configured' });
    }

    const prompt = `You are an expert teacher providing detailed feedback on a student's exam answer.

SUBJECT: ${subject}
QUESTION: ${questionText}
MARKS AWARDED: ${marksAwarded}/${maxMarks}

STUDENT'S ANSWER:
${studentAnswer}

Provide specific, encouraging feedback that:
1. Explains what the student did well (max 2-3 points)
2. Identifies areas for improvement (max 2-3 points)
3. Offers actionable suggestions for better answers next time (max 2 points)

Keep the tone supportive and educational. Focus on learning rather than criticism.`;

    console.log(`📝 [Server] Generating feedback for: ${questionText.substring(0, 30)}...`);

    const response = await fetch(NVIDIA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nvidiaApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content || '';

    console.log(`✅ [Server] Feedback generated successfully`);
    return res.json({
      success: true,
      feedback,
      source: 'kimi-k2.5',
    });
  } catch (error) {
    console.error('❌ [Server] Feedback Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/explanation
 * Generate topic explanation
 */
router.post('/explanation', async (req, res) => {
  try {
    const { topic, context = '' } = req.body;
    const nvidiaApiKey = process.env.NVIDIA_API_KEY;

    if (!nvidiaApiKey) {
      return res.status(400).json({ success: false, error: 'API key not configured' });
    }

    const prompt = `Explain the following topic concisely and clearly, suitable for a student learning:

TOPIC: ${topic}
${context ? `CONTEXT: ${context}` : ''}

Provide:
1. Brief definition (1-2 sentences)
2. Key points (bullet list, max 4 points)
3. Common misconceptions (if any)
4. Real-world example

Keep it concise and educational.`;

    console.log(`📚 [Server] Explaining topic: ${topic}`);

    const response = await fetch(NVIDIA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nvidiaApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 400,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || '';

    console.log(`✅ [Server] Explanation generated`);
    return res.json({
      success: true,
      explanation,
      source: 'kimi-k2.5',
    });
  } catch (error) {
    console.error('❌ [Server] Explanation Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
