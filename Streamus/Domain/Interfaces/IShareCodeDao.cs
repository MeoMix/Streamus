using System;

namespace Streamus.Domain.Interfaces
{
    public interface IShareCodeDao : IDao<ShareCode>
    {
        ShareCode Get(Guid id);
    }
}
