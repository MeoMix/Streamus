using Streamus.Dao;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Domain.Managers
{
    public class FolderManager : AbstractManager
    {
        private IFolderDao FolderDao { get; set; }

        public FolderManager()
        {
            FolderDao = DaoFactory.GetFolderDao();
        }

        public void Save(Folder folder)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                folder.ValidateAndThrow();
                FolderDao.Save(folder);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

    }
}