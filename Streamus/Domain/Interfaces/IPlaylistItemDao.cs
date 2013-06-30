using System;

namespace Streamus.Domain.Interfaces
{
    public interface IPlaylistItemDao : IDao<PlaylistItem>
    {
        PlaylistItem Get(Guid id);
    }
}
