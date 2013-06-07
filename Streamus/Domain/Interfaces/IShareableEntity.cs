using System;

namespace Streamus.Domain.Interfaces
{
    public interface IShareableEntity
    {
        Guid Id { get; set; }
        string GetUrlFriendlyTitle();
        string GetShortId();
    }
}
