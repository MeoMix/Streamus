using System;
using System.Collections.Generic;
using System.Reflection;
using NHibernate.Exceptions;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.DataInterfaces;
using log4net;

namespace Streamus.Backend.Domain.Managers
{
    public class SongManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private ISongDao SongDao { get; set; }

        public SongManager(ISongDao songDao)
        {
            SongDao = songDao;
        }

        public void SaveSong(Song song)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                song.ValidateAndThrow();

                //No need to update a song for now.
                if (SongDao.GetByVideoId(song.VideoId) == null)
                {
                    SongDao.Save(song);
                }

                try
                {
                    NHibernateSessionManager.Instance.CommitTransaction();
                }
                catch (GenericADOException exception)
                {
                    //The song got saved somewhere else. This is pretty unlikely and also not a big deal at all.
                    Logger.Error(exception);
                }
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

                    try
                    {
                        NHibernateSessionManager.Instance.CommitTransaction();
                    }
                    catch (GenericADOException exception)
                    {
                        //Got beaten to saving a song, oh well.
                        Logger.Error(exception);
                    }
                }
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        //Songs won't be deleted very often. No one user is able to do it -- so doesn't take a userId. Needs to be an admin.
        public void DeleteSongByVideoId(string videoId)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                Song song = SongDao.GetByVideoId(videoId);
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

        public IList<Song> GetByVideoIds(List<string> videoIds)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                IList<Song> songs = SongDao.GetByVideoIds(videoIds);
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