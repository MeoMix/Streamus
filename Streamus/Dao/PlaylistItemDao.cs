using NHibernate;
using NHibernate.Criterion;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Dao
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