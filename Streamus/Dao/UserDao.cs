using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Dao
{
    public class UserDao : AbstractNHibernateDao<User>, IUserDao
    {
        public User Get(Guid id)
        {
            User user = null;

            if (id != default(Guid))
            {
                user = NHibernateSession.Get<User>(id);
            }

            return user;
        }
    }
}