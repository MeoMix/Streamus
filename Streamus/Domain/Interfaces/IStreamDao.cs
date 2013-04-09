using System;

namespace Streamus.Domain.Interfaces
{
    public interface IStreamDao : IDao<Stream>
    {
        Stream Get(Guid id);
    }
}