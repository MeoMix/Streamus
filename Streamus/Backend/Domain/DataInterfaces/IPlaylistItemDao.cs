using System;
using System.Collections.Generic;

namespace Streamus.Backend.Domain.DataInterfaces
{
    public interface IPlaylistItemDao : IDao<PlaylistItem>
    {
        PlaylistItem GetByPosition(Guid playlistId, int position);
        PlaylistItem GetBySongId(Guid songId);
        PlaylistItem GetSelected(Guid playlistId);
    }
}
