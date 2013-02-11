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

        public Playlist GetByPosition(Guid collectionId, int position)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (Playlist), "Playlist")
                .Add(Restrictions.Eq("Position", position))
                .Add(Restrictions.Eq("Collection.Id", collectionId));

            Playlist playlist = criteria.UniqueResult<Playlist>();

            return playlist;
        }
    }
}