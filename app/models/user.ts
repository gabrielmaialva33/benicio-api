import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import {
  afterCreate,
  BaseModel,
  beforeCreate,
  beforeFetch,
  beforeFind,
  beforePaginate,
  beforeSave,
  column,
  manyToMany,
  SnakeCaseNamingStrategy,
} from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import * as model from '@adonisjs/lucid/types/model'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from '#models/role'
import Permission from '#models/permission'
import Folder from '#models/folder'
import IRole from '#interfaces/role_interface'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email', 'username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  static refreshTokens = DbAccessTokensProvider.forModel(User, {
    type: 'refresh_token',
    expiresIn: '3d',
  })

  static table = 'users'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare full_name: string

  @column()
  declare email: string

  @column()
  declare username: string | null

  @column()
  declare user_type: 'employee' | 'manager' | 'client'

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: null })
  declare is_deleted: boolean

  @column.date()
  declare birthday: DateTime | null

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => {
      if (typeof value === 'string') {
        return JSON.parse(value)
      }
      return value
    },
  })
  declare metadata: {
    email_verified: boolean
    email_verification_token: string | null
    email_verification_sent_at: string | null
    email_verified_at: string | null
  }

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
  })
  declare roles: ManyToMany<typeof Role>

  @manyToMany(() => Permission, {
    pivotTable: 'user_permissions',
    pivotTimestamps: true,
    pivotColumns: ['granted', 'expires_at'],
  })
  declare permissions: ManyToMany<typeof Permission>

  @manyToMany(() => Folder, {
    pivotTable: 'user_favorite_folders',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare favorite_folders: ManyToMany<typeof Folder>

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get avatar_url(): string {
    // Generate deterministic avatar based on user ID
    // Using avataaars.io with random seed based on user ID
    const seed = this.id || 0
    const topTypes = ['NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1']
    const accessoriesTypes = [
      'Blank',
      'Kurt',
      'Prescription01',
      'Prescription02',
      'Round',
      'Sunglasses',
      'Wayfarers',
    ]
    const facialHairTypes = [
      'Blank',
      'BeardMedium',
      'BeardLight',
      'BeardMajestic',
      'MoustacheFancy',
      'MoustacheMagnum',
    ]
    const clotheTypes = [
      'BlazerShirt',
      'BlazerSweater',
      'CollarSweater',
      'GraphicShirt',
      'Hoodie',
      'Overall',
      'ShirtCrewNeck',
      'ShirtScoopNeck',
      'ShirtVNeck',
    ]
    const eyeTypes = [
      'Close',
      'Cry',
      'Default',
      'Dizzy',
      'EyeRoll',
      'Happy',
      'Hearts',
      'Side',
      'Squint',
      'Surprised',
      'Wink',
      'WinkWacky',
    ]
    const eyebrowTypes = [
      'Angry',
      'AngryNatural',
      'Default',
      'DefaultNatural',
      'FlatNatural',
      'RaisedExcited',
      'RaisedExcitedNatural',
      'SadConcerned',
      'SadConcernedNatural',
      'UnibrowNatural',
      'UpDown',
      'UpDownNatural',
    ]
    const mouthTypes = [
      'Concerned',
      'Default',
      'Disbelief',
      'Eating',
      'Grimace',
      'Sad',
      'ScreamOpen',
      'Serious',
      'Smile',
      'Tongue',
      'Twinkle',
      'Vomit',
    ]
    const skinColors = ['Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black']

    // Use ID as seed for deterministic random selection
    const selectFromArray = (arr: string[], seedVal: number) => arr[seedVal % arr.length]

    return `https://avataaars.io/?avatarStyle=Circle&topType=${selectFromArray(topTypes, seed)}&accessoriesType=${selectFromArray(accessoriesTypes, seed + 1)}&facialHairType=${selectFromArray(facialHairTypes, seed + 2)}&clotheType=${selectFromArray(clotheTypes, seed + 3)}&eyeType=${selectFromArray(eyeTypes, seed + 4)}&eyebrowType=${selectFromArray(eyebrowTypes, seed + 5)}&mouthType=${selectFromArray(mouthTypes, seed + 6)}&skinColor=${selectFromArray(skinColors, seed + 7)}`
  }

  public get is_employee(): boolean {
    return this.user_type === 'employee'
  }

  public get is_manager(): boolean {
    return this.user_type === 'manager'
  }

  public get is_client(): boolean {
    return this.user_type === 'client'
  }

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeFind()
  @beforeFetch()
  static async softDeletes(query: model.ModelQueryBuilderContract<typeof User>) {
    query.where('is_deleted', false)
  }

  @beforePaginate()
  static async softDeletesPaginate(
    queries: [
      countQuery: model.ModelQueryBuilderContract<typeof User>,
      fetchQuery: model.ModelQueryBuilderContract<typeof User>,
    ]
  ) {
    queries.forEach((query) => query.where('is_deleted', false))
  }

  @beforeCreate()
  static async setUsername(user: User) {
    if (!user.username) {
      user.username = user.email.split('@')[0].trim().toLowerCase()
    }
  }

  @beforeSave()
  static async hashUserPassword(user: User) {
    if (user.$dirty.password && !hash.isValidHash(user.password)) {
      user.password = await hash.make(user.password)
    }
  }

  @afterCreate()
  static async setDefaultRole(user: User) {
    const role = await Role.findBy('slug', IRole.Slugs.USER)
    if (role) {
      await user.related('roles').attach([role.id])
    }
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static includeRoles(query: model.ModelQueryBuilderContract<typeof User>) {
    query.preload('roles')
  }
}
