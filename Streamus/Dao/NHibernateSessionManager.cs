using System;
using System.Reflection;
using System.Runtime.Remoting.Messaging;
using System.Web;
using NHibernate;
using NHibernate.Cfg;
using log4net;

namespace Streamus.Dao
{
    /// <summary>
    ///     Handles creation and management of sessions and transactions.  It is a singleton because
    ///     building the initial session factory is very expensive. Inspiration for this class came
    ///     from Chapter 8 of Hibernate in Action by Bauer and King.  Although it is a sealed singleton
    ///     you can use TypeMock (http://www.typemock.com) for more flexible testing.
    /// </summary>
    public class NHibernateSessionManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private const string TransactionKey = "CONTEXT_TRANSACTION";
        private const string SessionKey = "CONTEXT_SESSION";
        private ISessionFactory SessionFactory;

        #region Thread-safe, lazy Singleton

        /// <summary>
        ///     This is a thread-safe, lazy singleton.  See http://www.yoda.arachsys.com/csharp/singleton.html
        ///     for more details about its implementation.
        /// </summary>
        public static NHibernateSessionManager Instance
        {
            get
            {
                try
                {
                    return Nested.NHibernateSessionManager;
                }
                catch (TypeInitializationException exception)
                {
                    Logger.Error(exception.InnerException.Message);
                    throw exception.InnerException;
                }
            }
        }

        /// <summary>
        ///     Initializes the NHibernate session factory upon instantiation.
        /// </summary>
        private NHibernateSessionManager()
        {
            InitSessionFactory();
        }

        /// <summary>
        ///     Assists with ensuring thread-safe, lazy singleton
        /// </summary>
        // ReSharper disable ClassNeverInstantiated.Local
        private class Nested
            // ReSharper restore ClassNeverInstantiated.Local
        {
            static Nested()
            {
            }

            internal static readonly NHibernateSessionManager NHibernateSessionManager =
                new NHibernateSessionManager();
        }

        #endregion

        private void InitSessionFactory()
        {
            SessionFactory = new Configuration().Configure().BuildSessionFactory();
        }

        public ISession GetSession()
        {
            return ContextSession ?? (ContextSession = SessionFactory.OpenSession());
        }

        /// <summary>
        ///     Flushes anything left in the session and closes the connection.
        /// </summary>
        public void CloseSession()
        {
            ISession session = ContextSession;

            if (session != null && session.IsOpen)
            {
                if (session.Transaction.IsActive)
                {
                    session.Flush();
                }

                session.Close();
            }

            ContextSession = null;
        }

        public void Clear()
        {
            GetSession().Clear();
        }

        public void Evict(object obj)
        {
            GetSession().Evict(obj);
        }

        public void BeginTransaction()
        {
            ITransaction transaction = ContextTransaction;

            if (transaction == null)
            {
                transaction = GetSession().BeginTransaction();
                ContextTransaction = transaction;
            }
        }

        public void CommitTransaction()
        {
            ITransaction transaction = ContextTransaction;

            try
            {
                if (HasOpenTransaction())
                {
                    transaction.Commit();
                    ContextTransaction = null;
                }
            }
            catch (HibernateException exception)
            {
                Logger.Error(exception);
                RollbackTransaction();
                throw;
            }
        }

        public bool HasOpenTransaction()
        {
            ITransaction transaction = ContextTransaction;

            return transaction != null && !transaction.WasCommitted && !transaction.WasRolledBack;
        }

        public void RollbackTransaction()
        {
            ITransaction transaction = ContextTransaction;

            try
            {
                if (HasOpenTransaction())
                {
                    transaction.Rollback();
                }

                ContextTransaction = null;
            }
            finally
            {
                CloseSession();
            }
        }

        /// <summary>
        ///     Use an HttpContext during normal operations and a CallContext to emulate this during test.
        /// </summary>
        private static ITransaction ContextTransaction
        {
            get
            {
                if (IsInWebContext())
                {
                    return (ITransaction) HttpContext.Current.Items[TransactionKey];
                }
                return (ITransaction) CallContext.GetData(TransactionKey);
            }
            set
            {
                if (IsInWebContext())
                {
                    HttpContext.Current.Items[TransactionKey] = value;
                }
                else
                {
                    CallContext.SetData(TransactionKey, value);
                }
            }
        }

        /// <summary>
        ///     Use an HttpContext during normal operations and a CallContext to emulate this during test.
        /// </summary>
        private static ISession ContextSession
        {
            get
            {
                if (IsInWebContext())
                {
                    return (ISession) HttpContext.Current.Items[SessionKey];
                }
                return (ISession) CallContext.GetData(SessionKey);
            }
            set
            {
                if (IsInWebContext())
                {
                    HttpContext.Current.Items[SessionKey] = value;
                }
                else
                {
                    CallContext.SetData(SessionKey, value);
                }
            }
        }

        private static bool IsInWebContext()
        {
            return HttpContext.Current != null;
        }
    }
}