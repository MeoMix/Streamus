using System.Collections.Generic;

namespace Streamus.Backend.Domain.DataInterfaces
{
    public interface IVideoDao : IDao<Video>
    {
        Video GetById(string id);
        IList<Video> GetByIds(List<string> ids);
    }
}
