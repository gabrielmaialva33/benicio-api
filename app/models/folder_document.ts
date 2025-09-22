import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  scope,
  SnakeCaseNamingStrategy,
} from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Folder from '#models/folder'
import File from '#models/file'
import User from '#models/user'

type FolderDocumentBuilder = ModelQueryBuilderContract<typeof FolderDocument>

export default class FolderDocument extends BaseModel {
  static table = 'folder_documents'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare folder_id: number

  @column()
  declare file_id: number | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare document_type: string

  @column()
  declare file_name: string | null

  @column()
  declare file_path: string | null

  @column()
  declare file_key: string | null

  @column()
  declare file_size: number | null

  @column()
  declare mime_type: string | null

  @column()
  declare checksum: string | null

  @column()
  declare confidentiality_level: string

  @column()
  declare document_category: string | null

  @column()
  declare is_original: boolean

  @column()
  declare version_number: number

  @column()
  declare parent_document_id: number | null

  @column.date()
  declare document_date: DateTime | null

  @column.date()
  declare received_date: DateTime | null

  @column()
  declare court_protocol: string | null

  @column()
  declare requires_signature: boolean

  @column()
  declare is_signed: boolean

  @column.dateTime()
  declare signed_at: DateTime | null

  @column()
  declare signed_by_id: number | null

  @column()
  declare tags: string[] | null

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare notes: string | null

  @column()
  declare is_active: boolean

  @column()
  declare is_archived: boolean

  @column()
  declare sort_order: number

  @column()
  declare uploaded_by_id: number

  @column()
  declare updated_by_id: number | null

  @column.dateTime()
  declare deleted_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Folder, {
    foreignKey: 'folder_id',
  })
  declare folder: BelongsTo<typeof Folder>

  @belongsTo(() => File, {
    foreignKey: 'file_id',
  })
  declare file: BelongsTo<typeof File>

  @belongsTo(() => FolderDocument, {
    foreignKey: 'parent_document_id',
  })
  declare parent_document: BelongsTo<typeof FolderDocument>

  @belongsTo(() => User, {
    foreignKey: 'uploaded_by_id',
  })
  declare uploaded_by: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updated_by_id',
  })
  declare updated_by: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'signed_by_id',
  })
  declare signed_by: BelongsTo<typeof User>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeCreate()
  static async setDefaultValues(document: FolderDocument) {
    if (!document.confidentiality_level) {
      document.confidentiality_level = 'internal'
    }

    if (document.is_original === undefined || document.is_original === null) {
      document.is_original = true
    }

    if (!document.version_number) {
      document.version_number = 1
    }

    if (document.requires_signature === undefined || document.requires_signature === null) {
      document.requires_signature = false
    }

    if (document.is_signed === undefined || document.is_signed === null) {
      document.is_signed = false
    }

    if (document.is_active === undefined || document.is_active === null) {
      document.is_active = true
    }

    if (document.is_archived === undefined || document.is_archived === null) {
      document.is_archived = false
    }

    if (!document.sort_order) {
      document.sort_order = 0
    }
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static active = scope((query) => {
    query.where('is_active', true)
  })

  static byType = scope((query, type: string) => {
    query.where('document_type', type)
  })

  static byFolder = scope((query, folderId: number) => {
    query.where('folder_id', folderId)
  })

  static byConfidentiality = scope((query, level: string) => {
    query.where('confidentiality_level', level)
  })

  static originals = scope((query) => {
    query.where('is_original', true)
  })

  static signed = scope((query) => {
    query.where('is_signed', true)
  })

  static requiresSignature = scope((query) => {
    query.where('requires_signature', true).where('is_signed', false)
  })

  static recent = scope((query, days: number = 30) => {
    const pastDate = DateTime.now().minus({ days })
    query.where('created_at', '>=', pastDate.toSQL())
  })

  static search = scope((query, searchTerm: string) => {
    query.where((q) => {
      q.whereILike('title', `%${searchTerm}%`)
        .orWhereILike('description', `%${searchTerm}%`)
        .orWhereILike('file_name', `%${searchTerm}%`)
        .orWhereILike('court_protocol', `%${searchTerm}%`)
    })
  })

  static withRelationships = scope((query: FolderDocumentBuilder) => {
    query.preload('folder').preload('uploaded_by').preload('signed_by')
  })

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get displayName(): string {
    return this.title
  }

  public get fileSizeFormatted(): string {
    if (!this.file_size) return 'N/A'

    const units = ['B', 'KB', 'MB', 'GB']
    let size = this.file_size
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  public get isConfidential(): boolean {
    return ['confidential', 'restricted'].includes(this.confidentiality_level)
  }

  public get needsSignature(): boolean {
    return this.requires_signature && !this.is_signed
  }

  public get hasFile(): boolean {
    return !!(this.file_id || this.file_key || this.file_path)
  }

  public get ageInDays(): number {
    return Math.floor(DateTime.now().diff(this.created_at, 'days').days)
  }
}
