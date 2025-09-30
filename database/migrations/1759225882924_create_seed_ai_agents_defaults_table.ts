import { BaseSchema } from '@adonisjs/lucid/schema'
import { AI_AGENTS } from '#defaults/ai_agents_default'

export default class extends BaseSchema {
  protected tableName = 'ai_agents'

  async up() {
    // Insert 6 default AI agents from app/defaults/ai_agents_default.ts
    await this.defer(async (db) => {
      const agents = AI_AGENTS.map((agent) => ({
        name: agent.name,
        slug: agent.slug,
        description: agent.description,
        model: agent.model,
        capabilities: JSON.stringify(agent.capabilities),
        system_prompt: agent.systemPrompt,
        tools: JSON.stringify(agent.tools),
        config: JSON.stringify(agent.config),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }))

      await db.table(this.tableName).multiInsert(agents)
    })
  }

  async down() {
    // Remove all default agents
    await this.defer(async (db) => {
      await db
        .from(this.tableName)
        .whereIn('slug', [
          'legal-research',
          'document-analyzer',
          'case-strategy',
          'deadline-manager',
          'legal-writer',
          'client-communicator',
        ])
        .delete()
    })
  }
}
