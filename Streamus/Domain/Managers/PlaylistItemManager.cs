using Streamus.Dao;
using Streamus.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Streamus.Domain.Managers
{
    public class PlaylistItemManager : AbstractManager
    {
        private IPlaylistDao PlaylistDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private IVideoDao VideoDao { get; set; }

        private IShareCodeDao ShareCodeDao { get; set; }

        public PlaylistItemManager()
        {
            PlaylistDao = DaoFactory.GetPlaylistDao();
            PlaylistItemDao = DaoFactory.GetPlaylistItemDao();
            ShareCodeDao = DaoFactory.GetShareCodeDao();
            VideoDao = DaoFactory.GetVideoDao();
        }

        //  TODO: Consider removing the playlistId paramater.
        public void Delete(Guid itemId, Guid playlistId)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Playlist playlist = PlaylistDao.Get(playlistId);

                if (playlist == null)
                {
                    string errorMessage = string.Format("No playlist found with id: {0}", playlistId);
                    throw new ApplicationException(errorMessage);
                }

                PlaylistItem playlistItem = playlist.Items.First(item => item.Id == itemId);

                //  Be sure to remove from Playlist first so that cascade doesn't re-save.
                playlist.RemoveItem(playlistItem);
                PlaylistItemDao.Delete(playlistItem);

                PlaylistDao.Update(playlist);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Update(IEnumerable<PlaylistItem> playlistItems)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                foreach (PlaylistItem playlistItem in playlistItems)
                {
                    playlistItem.ValidateAndThrow();
                    playlistItem.Video.ValidateAndThrow();

                    PlaylistItem knownPlaylistItem = PlaylistItemDao.Get(playlistItem.Id);

                    if (knownPlaylistItem == null)
                    {
                        PlaylistItemDao.Update(playlistItem);
                    }
                    else
                    {
                        PlaylistItemDao.Merge(playlistItem);
                    }
                }

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Update(PlaylistItem playlistItem)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                playlistItem.ValidateAndThrow();
                playlistItem.Video.ValidateAndThrow();

                PlaylistItem knownPlaylistItem = PlaylistItemDao.Get(playlistItem.Id);

                if (knownPlaylistItem == null)
                {
                    PlaylistItemDao.Update(playlistItem);
                }
                else
                {
                    PlaylistItemDao.Merge(playlistItem);
                }

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Save(PlaylistItem playlistItem)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                DoSave(playlistItem);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        /// <summary>
        /// This is the work for saving a PlaylistItem without the Transaction wrapper.
        /// </summary>
        private void DoSave(PlaylistItem playlistItem)
        {            
		    //  TODO: This is a bit of a hack, but NHibernate pays attention to the "dirtyness" of immutable entities.
            //  As such, if two PlaylistItems reference the same Video object -- NonUniqueObjectException is thrown even though no changes
            //  can be persisted to the database.
            playlistItem.Video = VideoDao.Merge(playlistItem.Video);

            playlistItem.ValidateAndThrow();
            playlistItem.Video.ValidateAndThrow();

            PlaylistItemDao.Save(playlistItem);
        }

        public void Create(IEnumerable<PlaylistItem> playlistItems)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                playlistItems.ToList().ForEach(DoSave);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }
    }
}