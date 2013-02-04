using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using log4net;

namespace Streamus.Backend.Dao
{
    public class PlaylistDao : AbstractNHibernateDao<Playlist>, IPlaylistDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public Playlist Get(Guid id)
        {
            Playlist playlist = null;

            try
            {
                playlist = (Playlist)NHibernateSession.Load(typeof(Playlist), id);
            }
            catch (ObjectNotFoundException exception)
            {
                //  Consume error and return null.
                Logger.Error(exception);
            }

            return playlist;
        }

        public IList<Playlist> GetByUserId(Guid userId)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (Playlist), "Playlist")
                .Add(Restrictions.Eq("Playlist.UserId", userId));

            return criteria.List<Playlist>();
        }

        public Playlist GetByPosition(Guid userId, int position)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (Playlist), "Playlist")
                .Add(Restrictions.Eq("Position", position))
                .Add(Restrictions.Eq("UserId", userId))
                .SetMaxResults(1);

            Playlist playlist = criteria.List<Playlist>().FirstOrDefault();

            return playlist;
        }
    }
}