using System;
using System.Collections.Generic;
using NHibernate;
using Streamus.Domain.Interfaces;

namespace Streamus.Dao
{
    public class AbstractNHibernateDao<T> : MarshalByRefObject, IDao<T> where T : class
    {
        private readonly Type PersistentType = typeof (T);

        /// <summary>
        ///     Exposes the ISession used within the DAO.
        /// </summary>
        protected ISession NHibernateSession
        {
            get { return NHibernateSessionManager.Instance.GetSession(); }
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

        public T Merge(T entity)
        {
            return NHibernateSession.Merge(entity);
        }

        public void Save(T entity)
        {
            NHibernateSession.Save(entity);
        }

        public void Update(T entity)
        {
            NHibernateSession.Update(entity);
        }

        public void Delete(T entity)
        {
            NHibernateSession.Delete(entity);
        }
    }
}