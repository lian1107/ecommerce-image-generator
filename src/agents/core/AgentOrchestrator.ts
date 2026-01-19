import type { BaseAgent, AgentContext, AgentResult } from './BaseAgent';

/**
 * Manages Agent lifecycles and "thought logs"
 */
export class AgentOrchestrator {
    private static instance: AgentOrchestrator;

    // Hook to update UI state (will be set by the Store)
    private logHandler: ((agentName: string, thought: string) => void) | null = null;

    private constructor() { }

    static getInstance(): AgentOrchestrator {
        if (!AgentOrchestrator.instance) {
            AgentOrchestrator.instance = new AgentOrchestrator();
        }
        return AgentOrchestrator.instance;
    }

    public setLogHandler(handler: (agentName: string, thought: string) => void) {
        this.logHandler = handler;
    }

    /**
     * Log a thought from an agent.
     * Agents should call this (or BaseAgent calls this) to update the UI.
     */
    public log(agentName: string, thought: string) {
        if (this.logHandler) {
            this.logHandler(agentName, thought);
        } else {
            console.log(`[${agentName}] ${thought}`);
        }
    }

    /**
     * Run an Agent safely
     */
    public async runAgent<T>(agent: BaseAgent, context: AgentContext): Promise<AgentResult<T>> {
        this.log(agent.name, `Starting task...`);
        try {
            const result = await agent.run(context);
            if (result.success) {
                this.log(agent.name, `Task completed successfully.`);
            } else {
                this.log(agent.name, `Task failed: ${result.error}`);
            }
            return result;
        } catch (e: any) {
            this.log(agent.name, `Critical Error: ${e.message}`);
            return { success: false, error: e.message };
        }
    }
}
