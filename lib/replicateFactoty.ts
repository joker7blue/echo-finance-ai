import Replicate from "replicate";

const replicateInstance = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export class ReplicateFactory {
 
  static generateTextWithClaude(input: Record<string, unknown>) {
    return replicateInstance.run("anthropic/claude-3.7-sonnet", { input });
  }
}
