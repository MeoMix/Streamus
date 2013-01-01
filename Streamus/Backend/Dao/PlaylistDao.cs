using System;
using System.Collections.Generic;
using System.Linq;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;

namespace Streamus.Backend.Dao
{
    public class PlaylistDao : AbstractNHibernateDao<Playlist>, IPlaylistDao
    {
        public IList<Playlist> GetByUserId(Guid userId)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (Playlist), "Playlist")
                .Add(Restrictions.Eq("Playlist.UserId", userId));

            return criteria.List<Playlist>();
        }

        public Playlist GetByPlaylistItemId(Guid playlistItemId)
        {
            IQueryOver<Playlist, PlaylistItem> queryOver = NHibernateSession
                .QueryOver<Playlist>()
                .JoinQueryOver<PlaylistItem>(p => p.Items)
                .Where(pi => pi.Id == playlistItemId);
            //TODO: Can I set max result one somehow with this?

            Playlist playlist = queryOver.List().FirstOrDefault();

            return playlist;
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