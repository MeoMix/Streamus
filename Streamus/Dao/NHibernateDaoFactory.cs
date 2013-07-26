using Streamus.Domain.Interfaces;

namespace Streamus.Dao
<<<<<<< HEAD
{    
    /// <summary>
    /// Exposes access to NHibernate DAO classes.  Motivation for this DAO
    /// framework can be found at http://www.hibernate.org/328.html.
=======
{
    /// <summary>
    ///     Exposes access to NHibernate DAO classes.  Motivation for this DAO
    ///     framework can be found at http://www.hibernate.org/328.html.
>>>>>>> origin/Development
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

<<<<<<< HEAD
        public IStreamDao GetStreamDao()
        {
            return new StreamDao();
=======
        public IFolderDao GetFolderDao()
        {
            return new FolderDao();
>>>>>>> origin/Development
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