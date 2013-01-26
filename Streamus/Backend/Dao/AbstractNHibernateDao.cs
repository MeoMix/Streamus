using System;
using System.Collections.Generic;
using System.Reflection;
using NHibernate;
using Streamus.Backend.Domain.DataInterfaces;
using log4net;

namespace Streamus.Backend.Dao
{
    public class AbstractNHibernateDao<T> : MarshalByRefObject, IDao<T> where T : class
    {
        // ReSharper disable StaticFieldInGenericType
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        // ReSharper restore StaticFieldInGenericType
        private readonly Type PersistentType = typeof (T);

        /// <summary>
        /// Exposes the ISession used within the DAO.
        /// </summary>
        public ISession NHibernateSession
        {
            get { return NHibernateSessionManager.Instance.GetSession(); }
        }

        /// <summary>
        /// Loads an instance of type TypeOfListItem from the DB based on its ID.
        /// Video's PK is from YouTube - it overrides GetById with a string implementation.
        /// </summary>
        public T GetById(Guid id)
        {
            T entity = default(T);

            try
            {
                entity = (T) NHibernateSession.Load(PersistentType, id);
            }
            catch (ObjectNotFoundException exception)
            {   
                //Consume error and return null.
                Logger.Error(exception);
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