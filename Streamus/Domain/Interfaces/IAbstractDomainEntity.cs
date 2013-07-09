namespace Streamus.Domain.Interfaces
{
    public interface IAbstractDomainEntity<T>
    {
        T Id { get; set; }
    }
}