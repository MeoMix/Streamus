using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Dao
{
    public class FolderDao : AbstractNHibernateDao<Folder>, IFolderDao
    {
        public Folder Get(Guid id)
        {
            Folder folder = null;

            if (id != default(Guid))
            {
                folder = NHibernateSession.Get<Folder>(id);
            }

            return folder;
        }
    }
}