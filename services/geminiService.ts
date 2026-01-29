
import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel, PostType, Product } from "../types";

// Simulated Professional Veterinary Knowledge Base for RAG
const VET_KNOWLEDGE_BASE = [
  {
    topic: "Urinary Issues",
    content: "Male cats are prone to urethral obstructions. Straining to urinate, frequent trips to the litter box without output, or yowling while urinating are life-threatening emergencies requiring immediate vet intervention."
  },
  {
    topic: "Loss of Appetite",
    content: "If a cat doesn't eat for more than 24-48 hours, they are at high risk for Hepatic Lipidosis (fatty liver disease), which can be fatal. Inappetence in cats is always a clinically significant symptom."
  },
  {
    topic: "Toxic Plants",
    content: "Lilies (Lilium and Hemerocallis species) are extremely toxic to cats. Ingesting even a small amount of pollen or water from a vase can cause acute kidney failure. Immediate decontamination is required."
  },
  {
    topic: "Stress and Behavior",
    content: "Cats are creatures of habit. Changes in environment (moving, new pets, construction) often lead to stress-induced behaviors like over-grooming, hiding, or urinating outside the box (cystitis)."
  },
  {
    topic: "Vomiting",
    content: "Occasional hairballs are normal, but frequent vomiting (more than once a week) or projectile vomiting can indicate inflammatory bowel disease, kidney issues, or hyperthyroidism."
  },
  {
    topic: "Dental Health",
    content: "Periodontal disease affects 70% of cats by age 3. Bad breath, drooling, or dropping food can indicate painful resorptive lesions or gingivitis requiring professional cleaning."
  }
];

function retrieveContext(query: string): string {
  const keywords = query.toLowerCase();
  const relevantDocs = VET_KNOWLEDGE_BASE.filter(doc => 
    doc.topic.toLowerCase().split(' ').some(word => keywords.includes(word)) ||
    doc.content.toLowerCase().includes(keywords)
  );
  
  if (relevantDocs.length === 0) return "Consult general feline veterinary standards for common health and behavioral issues.";
  
  return relevantDocs.map(doc => `[Source: ${doc.topic}] ${doc.content}`).join('\n');
}

export const geminiService = {
  async triageQuery(query: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate the following cat-related query: "${query}". 
      Return a JSON object with:
      1. category: "HEALTH" (medical risk) or "BEHAVIOR" (care/habit)
      2. riskLevel: "Low", "Medium", or "High"
      3. shouldGoToVet: boolean
      4. suggestedPostType: "CARE_TIPS" or "PROBLEM"
      5. reasoning: brief explanation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            shouldGoToVet: { type: Type.BOOLEAN },
            suggestedPostType: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["category", "riskLevel", "shouldGoToVet", "suggestedPostType"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  async generatePostDraft(rawContent: string, type: PostType, style: 'Cute' | 'Witty' | 'Pro' | 'Story' = 'Cute') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let styleInstruction = "";
    switch(style) {
      case 'Witty': styleInstruction = "Make it funny, sassy, slightly sarcastic, and from the cat's perspective if possible."; break;
      case 'Pro': styleInstruction = "Make it informative, structured, clear, and professional like an experienced vet tech or cat expert."; break;
      case 'Story': styleInstruction = "Make it an engaging, warm narrative with emotional depth and descriptive language."; break;
      default: styleInstruction = "Make it extremely cute, friendly, enthusiastic, and full of feline-themed emojis."; break;
    }

    const prompt = `Act as an expert social media copywriter for a cat community.
    Original Content: "${rawContent || "A beautiful day in the cat circle"}"
    Post Category: ${type}
    Requested Style: ${styleInstruction}
    
    TASK: Polish and optimize the original content. Enhance the flow, improve the vocabulary, and make it engaging for other cat owners. 
    Maintain the core message of the original text but make it sound more professional and polished.
    Include 2-3 relevant hashtags at the very end. 
    Output ONLY the polished text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  },

  async getAssistantAdvice(query: string, history: any[], products: Product[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const retrievedContext = retrieveContext(query);
    const productContext = products.map(p => `- ID: ${p.id}, Name: ${p.name}, Price: ${p.usdPrice}USD, Desc: ${p.description}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are the CatCircle AI Assistant. Your mission is two-fold:
      1. Provide expert-level feline health and behavioral advice based on professional veterinary knowledge.
      2. Act as a personal shopping concierge by recommending relevant products from our in-app Mall that directly address the user's concerns.

      VET KNOWLEDGE CONTEXT:
      ${retrievedContext}
      
      MALL PRODUCTS CATALOG:
      ${productContext}
      
      USER INQUIRY: "${query}"
      
      GUIDELINES:
      - If the user mentions health symptoms, prioritize medical safety and risk assessment.
      - Always look through the MALL PRODUCTS CATALOG. If a product (like specific food, supplements, or gear) is relevant to the solution, include its ID in 'recommendedProductIds'.
      - Provide a 'communitySummary' that the user can share to the feed.
      
      Response must be valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, description: "Low, Medium, or High" },
            analysis: { type: Type.STRING, description: "Detailed medical/behavioral advice." },
            actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific steps to take." },
            citations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sources or topics referenced." },
            recommendedProductIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of matching product IDs from catalog." },
            communitySummary: { type: Type.STRING, description: "Short summary for social sharing." }
          },
          required: ["riskLevel", "analysis", "actionableSteps", "citations", "communitySummary", "recommendedProductIds"]
        }
      }
    });
    return JSON.parse(response.text);
  }
};
