using System;
using System.Collections.Generic;
using System.Reflection;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.DataInterfaces;
using log4net;

namespace Streamus.Backend.Domain.Managers
{
    public class SongManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private ISongDao SongDao { get; set; }
        private IPlaylistDao PlaylistDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }

        public SongManager(ISongDao songDao, IPlaylistDao playlistDao, IPlaylistItemDao playlistItemDao)
        {
            SongDao = songDao;
            PlaylistDao = playlistDao;
            PlaylistItemDao = playlistItemDao;
        }

        public void SaveSong(Song song)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                song.ValidateAndThrow();
                SongDao.SaveOrUpdate(song);
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public void SaveSongs(List<Song> songs)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                foreach (Song song in songs)
                {
                    song.ValidateAndThrow();
                    SongDao.SaveOrUpdate(song);
                }
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        //Songs won't be deleted very often. No one user is able to do it -- so doesn't take a userId. Needs to be an admin.
        public void DeleteSongById(Guid id)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                Song song = SongDao.GetById(id);
                SongDao.Delete(song);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public Song GetById(Guid id)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Song song = SongDao.GetById(id);
                NHibernateSessionManager.Instance.CommitTransaction();
                return song;
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public IList<Song> GetByIds(List<Guid> ids)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                IList<Song> songs = SongDao.GetByIds(ids);
                NHibernateSessionManager.Instance.CommitTransaction();
                return songs;
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }
    }
}