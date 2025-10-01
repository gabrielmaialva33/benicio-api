import User from '#models/user'

export default class GetFavoriteFoldersService {
  async execute(userId: number) {
    const user = await User.findOrFail(userId)

    const folders = await user
      .related('favorite_folders')
      .query()
      .preload('client')
      .preload('folder_type')
      .orderBy('user_favorite_folders.created_at', 'desc')

    return folders.map((folder) => ({
      id: folder.id,
      code: folder.cnj_number || folder.internal_client_code || `F-${folder.id}`,
      title: folder.title,
      client_name: folder.client.fantasy_name,
      color: folder.folder_type.color,
    }))
  }
}
