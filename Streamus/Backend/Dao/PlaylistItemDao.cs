using System;
using System.Collections.Generic;
using System.Linq;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;

namespace Streamus.Backend.Dao
{
    public class PlaylistItemDao : AbstractNHibernateDao<PlaylistItem>, IPlaylistItemDao
    {
        public PlaylistItem GetById(int id)
        {
            //I've opted to not use a composite key, but to use a softkey for NHibernate, but
            //there's no guarantee a getById will succeed when client needs it to due to responsiveness optimizations.
            throw new Exception("PlaylistItem's ID is a softkey. Please use GetByPosition.");
        }

        public PlaylistItem GetByPosition(Guid playlistId, int position)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (PlaylistItem), "PlaylistItem")
                .Add(Restrictions.Eq("PlaylistItem.Position", position))
                .Add(Restrictions.Eq("PlaylistItem.PlaylistId", playlistId))
                .SetMaxResults(1);

            PlaylistItem playlistItem = criteria.List<PlaylistItem>().FirstOrDefault();

            return playlistItem;
        }

        public PlaylistItem GetByVideoId(Guid videoId)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (PlaylistItem), "PlaylistItem")
                .Add(Restrictions.Eq("PlaylistItem.VideoId", videoId))
                .SetMaxResults(1);

            PlaylistItem playlistItem = criteria.List<PlaylistItem>().FirstOrDefault();

            return playlistItem;
        }

        public PlaylistItem GetSelected(Guid playlistId)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (PlaylistItem), "PlaylistItem")
                .Add(Restrictions.Eq("PlaylistItem.Selected", true))
                .Add(Restrictions.Eq("PlaylistItem.PlaylistId", playlistId))
                .SetMaxResults(1);

            PlaylistItem playlistItem = criteria.List<PlaylistItem>().FirstOrDefault();

            return playlistItem;
        }

        public IList<Playlist> GetByUserId(Guid userId)
        {
            ICriteria criteria = NHibernateSession
                .CreateCriteria(typeof (Playlist), "Playlist")
                .Add(Restrictions.Eq("Playlist.UserId", userId));

            return criteria.List<Playlist>();
        }
    }
}