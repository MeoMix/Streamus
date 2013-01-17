using System.Reflection;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;
using System.Collections.Generic;
using log4net;

namespace Streamus.Backend.Dao
{
    public class SongDao : AbstractNHibernateDao<Song>, ISongDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public Song GetByVideoId(string videoId)
        {
            Song song = null;
            try
            {
                song = (Song)NHibernateSession.Load(typeof(Song), videoId);
            }
            catch (ObjectNotFoundException exception)
            {
                //Consume error and return null.
                Logger.Error(exception);
            }

            return song;
        } 

        public IList<Song> GetByVideoIds(List<string> videoIds)
        {
            IQueryOver<Song, Song> criteria = NHibernateSession
                .QueryOver<Song>()
                .Where(song => song.VideoId.IsIn(videoIds));

            IList<Song> songs = criteria.List<Song>();

            return songs;
        }
    }
}