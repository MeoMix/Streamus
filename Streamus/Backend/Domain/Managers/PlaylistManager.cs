using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using NHibernate.Exceptions;
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

        public void CreatePlaylist(Playlist playlist)
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
                throw;
            }
        }

        //public void UpdatePlaylist(Playlist detachedPlaylist)
        //{
        //    try
        //    {
        //        NHibernateSessionManager.Instance.BeginTransaction();

        //        Playlist playlist = PlaylistDao.GetById(detachedPlaylist.Id);
        //        if (playlist == null)
        //        {
        //            throw new Exception("Shouldn't be null inside of UpdatePlaylist");
        //        }

        //        playlist.CopyFromDetached(detachedPlaylist);
        //        playlist.ValidateAndThrow();

        //        NHibernateSessionManager.Instance.CommitTransaction();
        //    }
        //    catch (Exception exception)
        //    {
        //        Logger.Error(exception);
        //        throw;
        //    }
        //}

        public void DeletePlaylistById(Guid id)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Playlist playlist = PlaylistDao.GetById(id);

                PlaylistDao.Delete(playlist);
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        /// <summary>
        /// Copy all the data from a detached playlistItem collection without breaking NHibernate entity mapping.
        /// </summary>
        /// <param name="playlistId">The playlist to update</param>
        /// <param name="detachedItems">The detached items to take data from and update the playlist with</param>
        public void UpdateItemPosition(Guid playlistId, List<PlaylistItem> detachedItems)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Playlist playlist = PlaylistDao.GetById(playlistId);

                foreach (PlaylistItem playlistItem in playlist.Items)
                {
                    //  Should always find an item.
                    PlaylistItem detachedItem = detachedItems.First(di => di.Position == playlistItem.Position);
                    playlistItem.CopyFromDetached(detachedItem);
                    PlaylistItemDao.Update(playlistItem);
                }
                
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }

        }

        public void UpdateTitle(Guid playlistId, string title)
        {
            NHibernateSessionManager.Instance.BeginTransaction();
            Playlist playlist = PlaylistDao.GetById(playlistId);
            playlist.Title = title;
            PlaylistDao.Update(playlist);
            NHibernateSessionManager.Instance.CommitTransaction();
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

        public void CreatePlaylistItem(PlaylistItem playlistItem)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                playlistItem.ValidateAndThrow();
                PlaylistItemDao.Save(playlistItem);
                try
                {
                    NHibernateSessionManager.Instance.CommitTransaction();
                }
                catch (GenericADOException exception)
                {
                    //Got beat to saving this entity. Not sure if this is a big deal or not...
                    Logger.Error(exception);
                }
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public void UpdatePlaylistItem(PlaylistItem playlistItem)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                playlistItem.ValidateAndThrow();
                PlaylistItemDao.Update(playlistItem);

                PlaylistItem knownPlaylistItem = PlaylistItemDao.GetByPosition(playlistItem.PlaylistId, playlistItem.Position);
                if (knownPlaylistItem == null)
                {
                    throw new Exception("Shouldn't be null inside of SavePlaylistItem");
                }
                
                PlaylistItemDao.Merge(playlistItem);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public void CreatePlaylistItems(IList<PlaylistItem> playlistItems)
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
                throw;
            }
        }
    }
}