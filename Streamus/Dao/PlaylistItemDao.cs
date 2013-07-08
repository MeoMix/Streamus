using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Dao
{
    public class PlaylistItemDao : AbstractNHibernateDao<PlaylistItem>, IPlaylistItemDao
    {
        public PlaylistItem Get(Guid id)
        {
            PlaylistItem playlistItem = null;

            if (id != default(Guid))
            {
                playlistItem = NHibernateSession.Get<PlaylistItem>(id);
            }

            return playlistItem;
        }
    }
}