using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Streamus.Dao;
using Streamus.Domain.Interfaces;
using log4net;

namespace Streamus.Domain.Managers
{
    public class PlaylistManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private IPlaylistDao PlaylistDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private IVideoDao VideoDao { get; set; }

        public PlaylistManager(IPlaylistDao playlistDao, IPlaylistItemDao playlistItemDao, IVideoDao videoDao)
        {
            PlaylistDao = playlistDao;
            PlaylistItemDao = playlistItemDao;
            VideoDao = videoDao;
        }

        public void Save(Playlist playlist)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                
                playlist.ValidateAndThrow();
                PlaylistDao.Save(playlist);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Update(Playlist playlist)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                playlist.ValidateAndThrow();

                Playlist knownPlaylist = PlaylistDao.Get(playlist.Id);

                if (knownPlaylist == null)
                {
                    PlaylistDao.Update(playlist);
                }
                else
                {
                    PlaylistDao.Merge(playlist);
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

        public void DeletePlaylistById(Guid id)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                Playlist playlist = PlaylistDao.Get(id);
                playlist.Stream.RemovePlaylist(playlist);
                PlaylistDao.Delete(playlist);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void UpdateTitle(Guid playlistId, string title)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Playlist playlist = PlaylistDao.Get(playlistId);
                playlist.Title = title;
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

        public void UpdateFirstItemId(Guid playlistId, Guid firstItemId)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Playlist playlist = PlaylistDao.Get(playlistId);
                playlist.FirstItemId = firstItemId;
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

        public void DeleteItem(Guid itemId, Guid playlistId)
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

        public void UpdatePlaylistItems(IEnumerable<PlaylistItem> playlistItems)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                foreach (PlaylistItem playlistItem in playlistItems)
                {
                    playlistItem.ValidateAndThrow();

                    PlaylistItem knownPlaylistItem = PlaylistItemDao.Get(playlistItem.PlaylistId, playlistItem.Id);

                    //  TODO: Sometimes we're updating and sometimes we're creating because the client
                    //  sets PlaylistItem's ID so its difficult to tell server-side.
                    if (knownPlaylistItem == null)
                    {
                        playlistItem.Video.ValidateAndThrow();

                        Video videoInSession = VideoDao.Get(playlistItem.Video.Id);

                        if (videoInSession == null)
                        {
                            VideoDao.Save(playlistItem.Video);
                        }

                        PlaylistItemDao.Save(playlistItem);
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

        public void UpdatePlaylistItem(PlaylistItem playlistItem)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                playlistItem.ValidateAndThrow();

                PlaylistItem knownPlaylistItem = PlaylistItemDao.Get(playlistItem.PlaylistId, playlistItem.Id);

                //  TODO: Sometimes we're updating and sometimes we're creating because the client
                //  sets PlaylistItem's ID so its difficult to tell server-side.
                if (knownPlaylistItem == null)
                {
                    playlistItem.Video.ValidateAndThrow();
                    //  TODO: Is this hitting the database? Surely it's not.
                    Video videoInSession = VideoDao.Get(playlistItem.Video.Id);

                    if (videoInSession == null)
                    {
                        VideoDao.Save(playlistItem.Video);
                    }

                    PlaylistItemDao.Save(playlistItem);
                }
                else
                {
                    //  TODO: I don't think I should need both of these, double check at some point.
                    //PlaylistItemDao.Update(playlistItem);
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

        public void CreatePlaylistItems(IEnumerable<PlaylistItem> playlistItems)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                foreach (PlaylistItem item in playlistItems)
                {
                    item.ValidateAndThrow();
                    //TODO: Optimize into one SQL query.
                    PlaylistItemDao.Save(item);
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
    }
}