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
                try
                {
                    folder = NHibernateSession.Load<Folder>(id);
                }
                catch
                {
                    //  Consume exception and return null folder.
                }
            }

            return folder;
        }
    }
}