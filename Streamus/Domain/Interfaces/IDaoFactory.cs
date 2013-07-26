namespace Streamus.Domain.Interfaces
{
    /// <summary>
    /// Provides an interface for retrieving DAO objects
    /// </summary>
    public interface IDaoFactory
    {
        IErrorDao GetErrorDao();
        IPlaylistDao GetPlaylistDao();
        IPlaylistItemDao GetPlaylistItemDao();
        IShareCodeDao GetShareCodeDao();
<<<<<<< HEAD
        IStreamDao GetStreamDao();
=======
        IFolderDao GetFolderDao();
>>>>>>> origin/Development
        IUserDao GetUserDao();
        IVideoDao GetVideoDao();
    }
}
