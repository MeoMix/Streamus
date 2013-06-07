
namespace Streamus.Domain.Interfaces
{
    public interface IShareCodeDao : IDao<ShareCode>
    {
        ShareCode GetByShortIdAndEntityTitle(string shareCodeShortId, string urlFriendlyEntityTitle);
    }
}
