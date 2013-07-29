using System;
using Streamus.Domain;
using Streamus.Domain.Interfaces;

namespace Streamus.Dao
{
    public class PlaylistDao : AbstractNHibernateDao<Playlist>, IPlaylistDao
    {
        public Playlist Get(Guid id)
        {
            Playlist playlist = null;

            if (id != default(Guid))
            {
                playlist = NHibernateSession.Load<Playlist>(id);
            }

            return playlist;
        }
    }
}