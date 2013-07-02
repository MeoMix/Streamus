using System;
using System.Reflection;
using NHibernate;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using log4net;

namespace Streamus.Dao
{
    public class PlaylistDao : AbstractNHibernateDao<Playlist>, IPlaylistDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public Playlist Get(Guid id)
        {
            Playlist playlist = null;

            if (id != default(Guid))
            {
                try
                {
                    playlist = (Playlist)NHibernateSession.Load(typeof(Playlist), id);
                }
                catch (ObjectNotFoundException exception)
                {
                    //  Consume error and return null.
                    Logger.Error(exception);
                }
            }

            return playlist;
        }
    }
}