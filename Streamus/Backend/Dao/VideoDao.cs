using System.Reflection;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Backend.Domain;
using System.Collections.Generic;
using Streamus.Backend.Domain.Interfaces;
using log4net;

namespace Streamus.Backend.Dao
{
    public class VideoDao : AbstractNHibernateDao<Video>, IVideoDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public Video Get(string id)
        {
            Video video = null;
            try
            {
                video = (Video)NHibernateSession.Load(typeof(Video), id);
            }
            catch (ObjectNotFoundException exception)
            {
                //  Consume error and return null.
                Logger.Error(exception);
            }

            return video;
        } 

        public IList<Video> Get(List<string> ids)
        {
            IQueryOver<Video, Video> criteria = NHibernateSession
                .QueryOver<Video>()
                .Where(video => video.Id.IsIn(ids));

            IList<Video> videos = criteria.List<Video>();

            return videos;
        }
    }
}