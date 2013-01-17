using System;
using System.Collections.Generic;

namespace Streamus.Backend.Domain.DataInterfaces
{
    public interface IDao<T>
    {
        T GetById(Guid id);
        List<T> GetAll();
        void SaveOrUpdate(T entity);
        T Merge(T entity);
        void Save(T entity);
        void Update(T entity);
        void Delete(T entity);
        void CommitChanges();
    }
}
