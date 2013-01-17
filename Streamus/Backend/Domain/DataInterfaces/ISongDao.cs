using System.Collections.Generic;

namespace Streamus.Backend.Domain.DataInterfaces
{
    public interface ISongDao : IDao<Song>
    {
        Song GetByVideoId(string videoId);
        IList<Song> GetByVideoIds(List<string> videoIds);
    }
}
