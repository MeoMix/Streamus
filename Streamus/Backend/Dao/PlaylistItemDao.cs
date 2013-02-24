using System;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;

namespace Streamus.Backend.Dao
{
    public class PlaylistItemDao : AbstractNHibernateDao<PlaylistItem>, IPlaylistItemDao
    {
        public PlaylistItem Get(Guid playlistId, Guid id)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (PlaylistItem), "PlaylistItem")
                .Add(Restrictions.Eq("PlaylistItem.Id", id))
                .Add(Restrictions.Eq("PlaylistItem.PlaylistId", playlistId));

            PlaylistItem playlistItem = criteria.UniqueResult<PlaylistItem>();

            return playlistItem;
        }
    }
}