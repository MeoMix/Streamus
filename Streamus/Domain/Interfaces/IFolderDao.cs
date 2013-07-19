using System;

namespace Streamus.Domain.Interfaces
{
    public interface IFolderDao : IDao<Folder>
    {
        Folder Get(Guid id);
    }
}