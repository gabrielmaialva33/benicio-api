/**
 * BaseTool
 * Abstract base class for all AI agent tools
 */
export default abstract class BaseTool {
  abstract name: string
  abstract description: string
  abstract parameters: Record<string, any>

  /**
   * Execute the tool with given parameters
   */
  abstract execute(parameters: Record<string, any>): Promise<any>

  /**
   * Get OpenAI function definition format
   */
  getDefinition(): {
    type: 'function'
    function: {
      name: string
      description: string
      parameters: Record<string, any>
    }
  } {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters,
      },
    }
  }
}
