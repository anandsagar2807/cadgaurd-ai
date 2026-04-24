import Groq from 'groq-sdk';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error('Missing Groq API key. Please set VITE_GROQ_API_KEY in your environment.');
}

const groq = new Groq({
  apiKey: groqApiKey,
  dangerouslyAllowBrowser: true, // Required for browser-based usage
});

// System prompts for different content types
const SYSTEM_PROMPTS = {
  landingContent: `You are an expert content writer for CADGuard AI, a cutting-edge AI-powered CAD validation and analysis platform. 
Create compelling, professional marketing content that highlights key features, benefits, and value propositions. 
Keep content concise but impactful. Always mention that the platform uses advanced AI and machine learning.`,

  dashboardContent: `You are an AI assistant for CADGuard AI dashboard. Generate insightful analytics summaries, key metrics, 
and actionable insights about CAD projects, design validations, and engineering metrics. 
Format responses as clear, structured JSON when requested.`,

  cadAnalysis: `You are an expert CAD engineer and design analyst. Provide detailed technical analysis of CAD designs including:
- Design issues and recommendations
- Manufacturing feasibility assessment
- Tolerance and specification analysis
- Cost optimization suggestions
- Best practices and improvements
Be specific and technical in your analysis.`,

  designSuggestions: `You are a design optimization expert. Provide specific, actionable design improvements and best practices
for CAD models. Focus on manufacturability, cost reduction, and performance optimization.`,

  validationReport: `You are a CAD validation specialist. Generate detailed validation reports including issues found,
severity levels, recommendations, and compliance checks. Be thorough and professional.`,

  copilot: `You are CADGuard AI Copilot, an expert assistant for CAD design and engineering tasks. 
Help users with design questions, technical advice, and best practices. Be helpful, concise, and professional.`,
};

export const groqService = {
  // Generate landing page content
  generateLandingContent: async (section: string): Promise<string> => {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Generate engaging content for the ${section} section of a CADGuard AI landing page. 
Keep it concise and impactful. Return plain text only.`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 500,
      system: SYSTEM_PROMPTS.landingContent,
    });

    return message.choices[0]?.message?.content || '';
  },

  // Generate dashboard analytics
  generateDashboardContent: async (filter: string, metric: string): Promise<any> => {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Generate dashboard analytics for CADGuard AI. Filter: ${filter}, Metric: ${metric}. 
Return a JSON object with keys: summary, metrics (array of key metrics with values), trends, and recommendations.`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 800,
      system: SYSTEM_PROMPTS.dashboardContent,
    });

    try {
      const content = message.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content };
    } catch {
      return { summary: message.choices[0]?.message?.content };
    }
  },

  // Generate CAD validation report
  generateValidationReport: async (fileInfo: string): Promise<any> => {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Generate a detailed CAD validation report for: ${fileInfo}. 
Return JSON with: issues (array with id, type, severity, message, category), summary, and recommendations.`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1500,
      system: SYSTEM_PROMPTS.validationReport,
    });

    try {
      const content = message.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { issues: [], summary: content };
    } catch {
      return { issues: [], summary: message.choices[0]?.message?.content };
    }
  },

  // Generate design analysis
  generateDesignAnalysis: async (designDescription: string): Promise<any> => {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Analyze this CAD design: ${designDescription}. 
Return JSON with: analysis (detailed analysis), issues (array), suggestions (array of improvements), and metrics (manufacturability, cost-efficiency scores 0-100).`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1500,
      system: SYSTEM_PROMPTS.cadAnalysis,
    });

    try {
      const content = message.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: content };
    } catch {
      return { analysis: message.choices[0]?.message?.content };
    }
  },

  // Generate design suggestions
  generateDesignSuggestions: async (context: string): Promise<string[]> => {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Based on this CAD design context: ${context}. 
Generate 5 specific design improvement suggestions. Return as JSON array of strings.`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.8,
      max_tokens: 600,
      system: SYSTEM_PROMPTS.designSuggestions,
    });

    try {
      const content = message.choices[0]?.message?.content || '[]';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [content];
    } catch {
      return [message.choices[0]?.message?.content || ''];
    }
  },

  // Copilot chat
  copilotChat: async (messages: Array<{ role: string; content: string }>): Promise<string> => {
    const response = await groq.chat.completions.create({
      messages: messages as any,
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1000,
      system: SYSTEM_PROMPTS.copilot,
    });

    return response.choices[0]?.message?.content || '';
  },

  // Generate comparison analysis
  generateComparisonAnalysis: async (design1: string, design2: string): Promise<any> => {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Compare these two CAD designs:
Design 1: ${design1}
Design 2: ${design2}

Return JSON with: comparison (detailed comparison), differences (array), advantages (array for each design), and recommendation.`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1200,
      system: SYSTEM_PROMPTS.cadAnalysis,
    });

    try {
      const content = message.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { comparison: content };
    } catch {
      return { comparison: message.choices[0]?.message?.content };
    }
  },

  // Generate export recommendations
  generateExportRecommendations: async (format: string): Promise<string> => {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Provide recommendations for exporting CAD designs in ${format} format. Include best practices, settings, and use cases.`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 500,
      system: 'You are an expert in CAD file formats and export optimization.',
    });

    return message.choices[0]?.message?.content || '';
  },
};
