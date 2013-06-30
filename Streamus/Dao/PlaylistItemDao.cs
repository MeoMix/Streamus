using System.Reflection;
using NHibernate;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System;
using log4net;

namespace Streamus.Dao
{
    public class PlaylistItemDao : AbstractNHibernateDao<PlaylistItem>, IPlaylistItemDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public PlaylistItem Get(Guid id)
        {
            PlaylistItem playlistItem = null;

            try
            {
                playlistItem = (PlaylistItem)NHibernateSession.Load(typeof(PlaylistItem), id);
            }
            catch (ObjectNotFoundException exception)
            {
                //  Consume error and return null.
                Logger.Error(exception);
            }

            return playlistItem;
        }
    }
}