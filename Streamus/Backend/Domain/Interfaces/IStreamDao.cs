using System;

namespace Streamus.Backend.Domain.Interfaces
{
    public interface IStreamDao : IDao<Stream>
    {
        Stream Get(Guid id);
    }
}