using log4net;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System.Collections.Generic;
using System.Reflection;

namespace Streamus.Dao
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