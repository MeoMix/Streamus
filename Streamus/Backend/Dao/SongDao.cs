using System;
using System.Collections.Generic;
using NHibernate;
using NHibernate.Criterion;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;

namespace Streamus.Backend.Dao
{
    public class SongDao : AbstractNHibernateDao<Song>, ISongDao
    {
        public IList<Song> GetByIds(List<Guid> ids)
        {
            IQueryOver<Song, Song> criteria = NHibernateSession
                .QueryOver<Song>()
                .Where(song => song.Id.IsIn(ids));

            IList<Song> songs = criteria.List<Song>();

            return songs;
        }
    }
}