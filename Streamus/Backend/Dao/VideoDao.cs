using System.Reflection;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;
using System.Collections.Generic;
using log4net;

namespace Streamus.Backend.Dao
{
    public class VideoDao : AbstractNHibernateDao<Video>, IVideoDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public Video GetById(string id)
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

        public IList<Video> GetByIds(List<string> ids)
        {
            IQueryOver<Video, Video> criteria = NHibernateSession
                .QueryOver<Video>()
                .Where(video => video.Id.IsIn(ids));

            IList<Video> videos = criteria.List<Video>();

            return videos;
        }
    }
}