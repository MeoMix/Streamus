using System;

namespace Streamus.Backend.Domain.Interfaces
{
    public interface IPlaylistDao : IDao<Playlist>
    {
        Playlist Get(Guid id);
    }
}
