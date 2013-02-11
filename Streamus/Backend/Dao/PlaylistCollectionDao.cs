using System;
using System.Reflection;
using NHibernate;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using log4net;

namespace Streamus.Backend.Dao
{
    public class PlaylistCollectionDao : AbstractNHibernateDao<PlaylistCollection>, IPlaylistCollectionDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public PlaylistCollection Get(Guid id)
        {
            PlaylistCollection playlistCollection = null;

            try
            {
                playlistCollection = (PlaylistCollection) NHibernateSession.Load(typeof (PlaylistCollection), id);
            }
            catch (ObjectNotFoundException exception)
            {
                //  Consume error and return null.
                Logger.Error(exception);
            }

            return playlistCollection;
        }
    }
}