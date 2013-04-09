using System;

namespace Streamus.Domain.Interfaces
{
    public interface IUserDao : IDao<User>
    {
        User Get(Guid id);
    }
}
