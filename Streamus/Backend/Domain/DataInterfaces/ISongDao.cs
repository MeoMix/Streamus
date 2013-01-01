using System;
using System.Collections.Generic;

namespace Streamus.Backend.Domain.DataInterfaces
{
    public interface ISongDao : IDao<Song>
    {
        IList<Song> GetByIds(List<Guid> ids);
    }
}
