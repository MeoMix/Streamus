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
                catch (Exception exception)
                {
                    //  Consume exception and return null playlist.
                }
            }

            return folder;
        }
    }
}