using System;
using System.Linq;
using Streamus.Dao;
using Streamus.Domain.Interfaces;

namespace Streamus.Domain.Managers
{
    public class ShareCodeManager : AbstractManager
    {
        private IPlaylistDao PlaylistDao { get; set; }
        private IShareCodeDao ShareCodeDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }

        public ShareCodeManager()
        {
            PlaylistDao = DaoFactory.GetPlaylistDao();
            ShareCodeDao = DaoFactory.GetShareCodeDao();
            PlaylistItemDao = DaoFactory.GetPlaylistItemDao();
        }

        public ShareCode GetShareCode(ShareableEntityType entityType, Guid entityId)
        {
            ShareCode shareCode;

            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                //  TODO: Support sharing other entities.
                if (entityType != ShareableEntityType.Playlist)
                {
                    throw new NotSupportedException("Only Playlist entityType can be shared currently.");
                }

                Playlist playlist = PlaylistDao.Get(entityId);

                if (playlist == null)
                {
                    string errorMessage = string.Format("No playlist found with id: {0}", entityId);
                    throw new ApplicationException(errorMessage);
                }

                var shareablePlaylistCopy = new Playlist();

                //  TODO: Reconsider this.
                shareablePlaylistCopy.NextPlaylist = shareablePlaylistCopy;
                shareablePlaylistCopy.PreviousPlaylist = shareablePlaylistCopy;

                shareablePlaylistCopy.ValidateAndThrow();
                PlaylistDao.Save(shareablePlaylistCopy);

                shareablePlaylistCopy.Copy(playlist);
                PlaylistDao.Update(shareablePlaylistCopy);

                //  TODO: This seems weird.
                //  Gotta do this manually.
                shareablePlaylistCopy.Items.ToList().ForEach(PlaylistItemDao.Save);

                shareCode = new ShareCode(shareablePlaylistCopy);

                shareCode.ValidateAndThrow();
                ShareCodeDao.Save(shareCode);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }

            return shareCode;
        }
    }
}