using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;

namespace Streamus.Backend.Dao
{
    public class UserDao : AbstractNHibernateDao<User>, IUserDao
    {
    }
}