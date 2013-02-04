using System;
using System.Collections.Generic;

namespace Streamus.Backend.Domain.Interfaces
{
    public interface IPlaylistDao : IDao<Playlist>
    {
        Playlist Get(Guid id);
        Playlist GetByPosition(Guid userId, int position);

        IList<Playlist> GetByUserId(Guid userId);
    }
}
