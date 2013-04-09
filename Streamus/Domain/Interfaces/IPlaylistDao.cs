using System;

namespace Streamus.Domain.Interfaces
{
    public interface IPlaylistDao : IDao<Playlist>
    {
        Playlist Get(Guid id);
    }
}
