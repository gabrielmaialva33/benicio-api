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
  declare folderId: number

  @column()
  declare fileId: number | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare documentType: string

  @column()
  declare fileName: string | null

  @column()
  declare filePath: string | null

  @column()
  declare fileKey: string | null

  @column()
  declare fileSize: number | null

  @column()
  declare mimeType: string | null

  @column()
  declare checksum: string | null

  @column()
  declare confidentialityLevel: string

  @column()
  declare documentCategory: string | null

  @column()
  declare isOriginal: boolean

  @column()
  declare versionNumber: number

  @column()
  declare parentDocumentId: number | null

  @column.date()
  declare documentDate: DateTime | null

  @column.date()
  declare receivedDate: DateTime | null

  @column()
  declare courtProtocol: string | null

  @column()
  declare requiresSignature: boolean

  @column()
  declare isSigned: boolean

  @column.dateTime()
  declare signedAt: DateTime | null

  @column()
  declare signedById: number | null

  @column()
  declare tags: string[] | null

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare notes: string | null

  @column()
  declare isActive: boolean

  @column()
  declare isArchived: boolean

  @column()
  declare sortOrder: number

  @column()
  declare uploadedById: number

  @column()
  declare updatedById: number | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Folder, {
    foreignKey: 'folderId',
  })
  declare folder: BelongsTo<typeof Folder>

  @belongsTo(() => File, {
    foreignKey: 'fileId',
  })
  declare file: BelongsTo<typeof File>

  @belongsTo(() => FolderDocument, {
    foreignKey: 'parentDocumentId',
  })
  declare parentDocument: BelongsTo<typeof FolderDocument>

  @belongsTo(() => User, {
    foreignKey: 'uploadedById',
  })
  declare uploadedBy: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updatedById',
  })
  declare updatedBy: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'signedById',
  })
  declare signedBy: BelongsTo<typeof User>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeCreate()
  static async setDefaultValues(document: FolderDocument) {
    if (!document.confidentialityLevel) {
      document.confidentialityLevel = 'internal'
    }

    if (document.isOriginal === undefined || document.isOriginal === null) {
      document.isOriginal = true
    }

    if (!document.versionNumber) {
      document.versionNumber = 1
    }

    if (document.requiresSignature === undefined || document.requiresSignature === null) {
      document.requiresSignature = false
    }

    if (document.isSigned === undefined || document.isSigned === null) {
      document.isSigned = false
    }

    if (document.isActive === undefined || document.isActive === null) {
      document.isActive = true
    }

    if (document.isArchived === undefined || document.isArchived === null) {
      document.isArchived = false
    }

    if (!document.sortOrder) {
      document.sortOrder = 0
    }
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static active = scope((query: FolderDocumentBuilder) => {
    query.where('is_active', true)
  })

  static byType = scope((query: FolderDocumentBuilder, type: string) => {
    query.where('document_type', type)
  })

  static byFolder = scope((query: FolderDocumentBuilder, folderId: number) => {
    query.where('folder_id', folderId)
  })

  static byConfidentiality = scope((query: FolderDocumentBuilder, level: string) => {
    query.where('confidentiality_level', level)
  })

  static originals = scope((query: FolderDocumentBuilder) => {
    query.where('is_original', true)
  })

  static signed = scope((query: FolderDocumentBuilder) => {
    query.where('is_signed', true)
  })

  static requiresSignature = scope((query: FolderDocumentBuilder) => {
    query.where('requires_signature', true).where('is_signed', false)
  })

  static recent = scope((query: FolderDocumentBuilder, days: number = 30) => {
    const pastDate = DateTime.now().minus({ days })
    query.where('created_at', '>=', pastDate.toSQL())
  })

  static search = scope((query: FolderDocumentBuilder, searchTerm: string) => {
    query.where((q) => {
      q.whereILike('title', `%${searchTerm}%`)
        .orWhereILike('description', `%${searchTerm}%`)
        .orWhereILike('file_name', `%${searchTerm}%`)
        .orWhereILike('court_protocol', `%${searchTerm}%`)
    })
  })

  static withRelationships = scope((query: FolderDocumentBuilder) => {
    query.preload('folder').preload('uploadedBy').preload('signedBy')
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
    if (!this.fileSize) return 'N/A'

    const units = ['B', 'KB', 'MB', 'GB']
    let size = this.fileSize
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  public get isConfidential(): boolean {
    return ['confidential', 'restricted'].includes(this.confidentialityLevel)
  }

  public get needsSignature(): boolean {
    return this.requiresSignature && !this.isSigned
  }

  public get hasFile(): boolean {
    return !!(this.fileId || this.fileKey || this.filePath)
  }

  public get ageInDays(): number {
    return Math.floor(DateTime.now().diff(this.createdAt, 'days').days)
  }
}
