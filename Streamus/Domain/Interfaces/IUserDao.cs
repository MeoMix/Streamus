using System;

namespace Streamus.Backend.Domain.Interfaces
{
    public interface IUserDao : IDao<User>
    {
        User Get(Guid id);
    }
}
