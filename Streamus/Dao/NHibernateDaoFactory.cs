using Streamus.Domain.Interfaces;

namespace Streamus.Dao
{
    /// <summary>
    ///     Exposes access to NHibernate DAO classes.  Motivation for this DAO
    ///     framework can be found at http://www.hibernate.org/328.html.
    /// </summary>
    public class NHibernateDaoFactory : IDaoFactory
    {
        public IErrorDao GetErrorDao()
        {
            return new ErrorDao();
        }

        public IPlaylistDao GetPlaylistDao()
        {
            return new PlaylistDao();
        }

        public IPlaylistItemDao GetPlaylistItemDao()
        {
            return new PlaylistItemDao();
        }

        public IShareCodeDao GetShareCodeDao()
        {
            return new ShareCodeDao();
        }

        public IFolderDao GetFolderDao()
        {
            return new FolderDao();
        }

        public IUserDao GetUserDao()
        {
            return new UserDao();
        }

        public IVideoDao GetVideoDao()
        {
            return new VideoDao();
        }
    }
}