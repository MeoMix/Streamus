using System;

namespace Streamus.Backend.Domain.Interfaces
{
    public interface IPlaylistDao : IDao<Playlist>
    {
        Playlist Get(Guid id);
        Playlist GetByPosition(Guid collectionId, int position);
    }
}
