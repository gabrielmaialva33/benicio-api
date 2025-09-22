import { BaseSchema } from '@adonisjs/lucid/schema'
import logger from '@adonisjs/core/services/logger'

export default class extends BaseSchema {
  async up() {
    logger.info('🏗️  Iniciando população de tipos de pasta padrão...')

    const folderTypes = [
      {
        name: 'Cível',
        slug: 'civil',
        description: 'Processos na área cível',
        color: '#3B82F6',
        is_active: true,
        sort_order: 1,
        workflow_config: {
          states: ['pre_registration', 'awaiting_info', 'registered', 'active', 'archived'],
          initial_state: 'pre_registration',
        },
        required_fields: ['title', 'client_id', 'case_value'],
        default_values: {
          search_progress: true,
          search_intimation: true,
          electronic: true,
        },
      },
      {
        name: 'Trabalhista',
        slug: 'labor',
        description: 'Processos na área trabalhista',
        color: '#EF4444',
        is_active: true,
        sort_order: 2,
        workflow_config: {
          states: ['pre_registration', 'awaiting_info', 'registered', 'active', 'archived'],
          initial_state: 'pre_registration',
        },
        required_fields: ['title', 'client_id'],
        default_values: {
          search_progress: true,
          search_intimation: true,
          electronic: true,
        },
      },
      {
        name: 'Criminal',
        slug: 'criminal',
        description: 'Processos na área criminal',
        color: '#DC2626',
        is_active: true,
        sort_order: 3,
        workflow_config: {
          states: ['pre_registration', 'awaiting_info', 'registered', 'active', 'archived'],
          initial_state: 'pre_registration',
        },
        required_fields: ['title', 'client_id'],
        default_values: {
          search_progress: false,
          search_intimation: true,
          electronic: false,
        },
      },
      {
        name: 'Tributário',
        slug: 'tax',
        description: 'Processos na área tributária',
        color: '#059669',
        is_active: true,
        sort_order: 4,
        workflow_config: {
          states: ['pre_registration', 'awaiting_info', 'registered', 'active', 'archived'],
          initial_state: 'pre_registration',
        },
        required_fields: ['title', 'client_id', 'case_value'],
        default_values: {
          search_progress: false,
          search_intimation: true,
          electronic: true,
        },
      },
      {
        name: 'Administrativo',
        slug: 'administrative',
        description: 'Processos na área administrativa',
        color: '#7C3AED',
        is_active: true,
        sort_order: 5,
        workflow_config: {
          states: ['pre_registration', 'awaiting_info', 'registered', 'active', 'archived'],
          initial_state: 'pre_registration',
        },
        required_fields: ['title', 'client_id'],
        default_values: {
          search_progress: false,
          search_intimation: true,
          electronic: true,
        },
      },
    ]

    logger.info(`📝 Inserindo ${folderTypes.length} tipos de pasta...`)

    for (const folderType of folderTypes) {
      try {
        await this.db.table('folder_types').insert({
          ...folderType,
          workflow_config: JSON.stringify(folderType.workflow_config),
          required_fields: JSON.stringify(folderType.required_fields),
          default_values: JSON.stringify(folderType.default_values),
          created_at: this.now(),
          updated_at: this.now(),
        })

        logger.info(`✅ Tipo de pasta "${folderType.name}" criado com sucesso`)
      } catch (error) {
        logger.error(`❌ Erro ao criar tipo de pasta "${folderType.name}": ${error.message}`)
        throw error
      }
    }

    logger.info('🎉 População de tipos de pasta concluída com sucesso!')
  }

  async down() {
    logger.info('🔄 Revertendo população de tipos de pasta...')

    const slugs = ['civil', 'labor', 'criminal', 'tax', 'administrative']

    for (const slug of slugs) {
      try {
        await this.db.from('folder_types').where('slug', slug).delete()
        logger.info(`🗑️  Tipo de pasta "${slug}" removido`)
      } catch (error) {
        logger.error(`❌ Erro ao remover tipo de pasta "${slug}": ${error.message}`)
      }
    }

    logger.info('♻️  Reversão de tipos de pasta concluída')
  }
}
