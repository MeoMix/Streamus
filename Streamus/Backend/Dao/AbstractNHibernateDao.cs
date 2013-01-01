using System;
using System.Collections.Generic;
using System.Reflection;
using NHibernate;
using Streamus.Backend.Domain.DataInterfaces;
using log4net;

namespace Streamus.Backend.Dao
{
    public class AbstractNHibernateDao<T> : MarshalByRefObject, IDao<T>
    {
        // ReSharper disable StaticFieldInGenericType
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        // ReSharper restore StaticFieldInGenericType
        private readonly Type PersistentType = typeof (T);

        /// <summary>
        ///     Exposes the ISession used within the DAO.
        /// </summary>
        public ISession NHibernateSession
        {
            get { return NHibernateSessionManager.Instance.GetSession(); }
        }

        /// <summary>
        ///     Loads an instance of type TypeOfListItem from the DB based on its ID.
        /// </summary>
        public T GetById(Guid id)
        {
            T entity = default(T);

            try
            {
                // TODO: Still not sure when we should be locking or not locking the DB.
                //if (shouldLock)
                //{
                //    entity = (T) NHibernateSession.Load(PersistentType, id, LockMode.Upgrade);
                //}
                //else
                //{
                entity = (T) NHibernateSession.Load(PersistentType, id);
                //}
            }
            catch (ObjectNotFoundException exception)
            {
                Logger.Error(exception);
                //Consume error and return null.
            }

            return entity;
        }

        /// <summary>
        ///     Loads every instance of the requested type with no filtering.
        /// </summary>
        public List<T> GetAll()
        {
            ICriteria criteria = NHibernateSession.CreateCriteria(PersistentType);
            return criteria.List<T>() as List<T>;
        }

        /// <summary>
        ///     For entities with automatatically generated IDs, such as identity, SaveOrUpdate may
        ///     be called when saving a new entity.  SaveOrUpdate can also be called to update any
        ///     entity, even if its ID is assigned. This method modifies the entity passed in.
        /// </summary>
        public void SaveOrUpdate(T entity)
        {
            NHibernateSession.SaveOrUpdate(entity);
        }

        public void Delete(T entity)
        {
            NHibernateSession.Delete(entity);
        }

        /// <summary>
        ///     Commits changes regardless of whether there's an open transaction or not.
        ///     Only use this when you want to commit data for a single DAO and not entire transaction.
        /// </summary>
        public void CommitChanges()
        {
            if (NHibernateSessionManager.Instance.HasOpenTransaction())
            {
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            else
            {
                // If there's no transaction, just flush the changes
                NHibernateSessionManager.Instance.GetSession().Flush();
            }
        }
    }
}