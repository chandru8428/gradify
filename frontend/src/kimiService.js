/**
 * Kimi K2.5 Service via NVIDIA API
 * Handles feedback generation, explanations, and initial analysis
 * Uses cheaper processing for non-critical scoring tasks
 */

const NVIDIA_API_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

/**
 * Initialize Kimi K2.5 for feedback and explanation generation
 * @param {string} apiKey - NVIDIA API key
 * @returns {Object} Kimi service with methods
 */
export const initializeKimiService = (apiKey) => {
  if (!apiKey || !apiKey.trim()) {
    console.warn('⚠️ Kimi K2.5 (NVIDIA) API key not configured. Feedback generation will be disabled.');
    return null;
  }

  return {
    /**
     * Generate detailed feedback and explanation for answers
     * @param {string} subject - Subject name
     * @param {string} studentAnswer - Student's answer text/content
     * @param {string} questionText - Question being answered
     * @param {number} marksAwarded - Marks given by primary evaluator
     * @param {number} maxMarks - Maximum marks for this question
     * @returns {Promise<Object>} Feedback object with explanations
     */
    generateFeedback: async (subject, studentAnswer, questionText, marksAwarded, maxMarks) => {
      try {
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

        const response = await fetch(NVIDIA_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2.5',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
            top_p: 0.9,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Feedback API Error:', errorData);
          throw new Error(`NVIDIA API Error (${response.status}): ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        const feedback = data.choices?.[0]?.message?.content || '';

        return {
          success: true,
          feedback,
          source: 'kimi-k2.5',
        };
      } catch (error) {
        console.error('❌ Kimi K2.5 Feedback Generation Failed:', error);
        return {
          success: false,
          feedback: 'Unable to generate detailed feedback. Check API connectivity.',
          error: error.message,
          source: 'kimi-k2.5',
        };
      }
    },

    /**
     * Generate explanations for complex topics
     * @param {string} topic - Topic or concept to explain
     * @param {string} context - Context about how it relates to the exam
     * @returns {Promise<Object>} Explanation object
     */
    generateExplanation: async (topic, context = '') => {
      try {
        const prompt = `Explain the following topic concisely and clearly, suitable for a student learning:

TOPIC: ${topic}
${context ? `CONTEXT: ${context}` : ''}

Provide:
1. Brief definition (1-2 sentences)
2. Key points (bullet list, max 4 points)
3. Common misconceptions (if any)
4. Real-world example

Keep it concise and educational.`;

        const response = await fetch(NVIDIA_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2.5',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.6,
            max_tokens: 400,
            top_p: 0.9,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`NVIDIA API Error: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        const explanation = data.choices?.[0]?.message?.content || '';

        return {
          success: true,
          explanation,
          source: 'kimi-k2.5',
        };
      } catch (error) {
        console.error('❌ Kimi K2.5 Explanation Generation Failed:', error);
        return {
          success: false,
          explanation: 'Unable to generate explanation at this time.',
          error: error.message,
          source: 'kimi-k2.5',
        };
      }
    },

    /**
     * Generate initial question-by-question analysis before final scoring
     * @param {string} subject - Subject  
     * @param {Array} questionsData - Array of question-answer pairs
     * @returns {Promise<Object>} Analysis results
     */
    analyzeAnswersInitial: async (subject, questionsData) => {
      try {
        const questionsText = questionsData
          .map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.answer}`)
          .join('\n\n');

        const prompt = `As an exam reviewer, provide initial analysis of these student answers for ${subject}.

${questionsText}

For each answer, identify:
1. Key concepts addressed
2. Accuracy level (Excellent/Good/Partial/Weak)
3. Missing elements
4. Evidence of understanding

Format as a structured review, not a score. This will be used for deeper evaluation.`;

        const response = await fetch(NVIDIA_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2.5',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.5,
            max_tokens: 1000,
            top_p: 0.9,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`NVIDIA API Error: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        const analysis = data.choices?.[0]?.message?.content || '';

        return {
          success: true,
          analysis,
          source: 'kimi-k2.5',
        };
      } catch (error) {
        console.error('❌ Kimi K2.5 Analysis Failed:', error);
        return {
          success: false,
          analysis: '',
          error: error.message,
          source: 'kimi-k2.5',
        };
      }
    },
  };
};

export default initializeKimiService;
