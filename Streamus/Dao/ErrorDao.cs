using System;
using System.Reflection;
using NHibernate;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using log4net;

namespace Streamus.Backend.Dao
{
    public class ErrorDao : AbstractNHibernateDao<Error>, IErrorDao
    {
    }
}