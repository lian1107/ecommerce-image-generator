export interface AgentContext {
    systemPrompt?: string;
    userPrompt?: string;
    images?: string[]; // base64
    additionalData?: any;
}

export interface AgentResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    thoughtProcess?: string[]; // Chain of Thought logs
}

/**
 * Abstract Base Class for all AI Agents
 */
export abstract class BaseAgent {
    name: string;
    role: string;

    constructor(name: string, role: string) {
        this.name = name;
        this.role = role;
    }

    /**
     * Main execution method
     */
    abstract run(context: AgentContext): Promise<AgentResult>;

    /**
     * Internal 'thinking' process - logs thought to console/storage
     */
    protected logThought(thought: string): void {
        console.log(`[${this.name}] 🤔 ${thought}`);
        // Future: Push to a centralized store via Orchestrator
    }

    /**
     * Safe JSON parsing helper
     */
    protected parseJson<T>(text: string): T | null {
        try {
            // Remove code blocks if present
            const cleanText = text.replace(/```json\s*|\s*```/g, '');
            return JSON.parse(cleanText) as T;
        } catch (e) {
            console.error(`[${this.name}] JSON Parse Error:`, e);
            return null;
        }
    }
}
