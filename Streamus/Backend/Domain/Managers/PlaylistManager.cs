using System;
using System.Reflection;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.DataInterfaces;
using log4net;

namespace Streamus.Backend.Domain.Managers
{
    public class PlaylistManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private IPlaylistDao PlaylistDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }

        public PlaylistManager(IPlaylistDao playlistDao, IPlaylistItemDao playlistItemDao)
        {
            PlaylistDao = playlistDao;
            PlaylistItemDao = playlistItemDao;
        }

        public void SavePlaylist(Playlist playlist)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                playlist.ValidateAndThrow();
                PlaylistDao.SaveOrUpdate(playlist);
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public void DeletePlaylistById(Guid id, Guid userId)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                Playlist playlist = PlaylistDao.GetById(id);

                if (playlist.UserId != userId)
                {
                    const string errorMessage = "The specified playlist is not for the given user.";
                    throw new ApplicationException(errorMessage);
                }

                PlaylistDao.Delete(playlist);
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public void DeleteItemByPosition(Guid playlistId, int itemPosition, Guid userId)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Playlist playlist = PlaylistDao.GetById(playlistId);

                if (playlist.UserId != userId)
                {
                    const string errorMessage = "The specified playlist is not for the given user.";
                    throw new ApplicationException(errorMessage);
                }

                PlaylistItem playlistItem = PlaylistItemDao.GetByPosition(playlistId, itemPosition);
                //Be sure to remove from Playlist first so that cascade doesn't re-save.
                playlist.Items.Remove(playlistItem);
                PlaylistItemDao.Delete(playlistItem);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public void SavePlaylistItem(PlaylistItem playlistItem)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                playlistItem.ValidateAndThrow();
                PlaylistItemDao.SaveOrUpdate(playlistItem);
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }
    }
}