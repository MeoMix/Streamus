using Streamus.Dao;
using Streamus.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Streamus.Domain.Managers
{
    public class PlaylistItemManager : AbstractManager
    {
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private IVideoDao VideoDao { get; set; }

        public PlaylistItemManager()
        {
            PlaylistItemDao = DaoFactory.GetPlaylistItemDao();
            VideoDao = DaoFactory.GetVideoDao();
        }

        public void Delete(Guid itemId)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                PlaylistItem playlistItem = PlaylistItemDao.Get(itemId);

                //  Be sure to remove from Playlist first so that cascade doesn't re-save.
                playlistItem.Playlist.RemoveItem(playlistItem);
                PlaylistItemDao.Delete(playlistItem);

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

        public void Save(IEnumerable<PlaylistItem> playlistItems)
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

        /// <summary>
        /// This is the work for saving a PlaylistItem without the Transaction wrapper.
        /// </summary>
        private void DoSave(PlaylistItem playlistItem)
        {            
		    //  This is a bit of a hack, but NHibernate pays attention to the "dirtyness" of immutable entities.
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