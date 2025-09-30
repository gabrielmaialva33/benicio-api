import User from '#models/user'

export default class GetFavoriteFoldersService {
  async execute(userId: number) {
    const user = await User.findOrFail(userId)

    const folders = await user
      .related('favoriteFolders')
      .query()
      .preload('client')
      .preload('folderType')
      .orderBy('user_favorite_folders.created_at', 'desc')

    return folders.map((folder) => ({
      id: folder.id,
      code: folder.cnjNumber || folder.internalClientCode || `F-${folder.id}`,
      title: folder.title,
      client_name: folder.client.fantasyName,
      color: folder.folderType.color,
    }))
  }
}
