using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Domain
{
    public abstract class AbstractDomainEntity<T> : IAbstractDomainEntity<T>
    {
        public virtual T Id { get; set; }

        private int? _oldHashCode;
        public override int GetHashCode()
        {
            // Once we have a hash code we'll never change it
            if (_oldHashCode.HasValue)
                return _oldHashCode.Value;

            //  The default of string is NULL not string.Empty
            bool thisIsTransient = typeof (T) == typeof (String) ? Equals(Id, string.Empty) : Equals(Id, default(T));

            // When this instance is transient, we use the base GetHashCode()
            // and remember it, so an instance can NEVER change its hash code.
            if (thisIsTransient)
            {
                _oldHashCode = base.GetHashCode();
                return _oldHashCode.Value;
            }
            return Id.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            AbstractDomainEntity<T> other = obj as AbstractDomainEntity<T>;
            if (other == null)
                return false;

            // handle the case of comparing two NEW objects
            bool otherIsTransient = typeof(T) == typeof(String) ? Equals(other.Id, string.Empty) : Equals(other.Id, default(T));
            bool thisIsTransient = typeof(T) == typeof(String) ? Equals(Id, string.Empty) : Equals(Id, default(T));
            if (otherIsTransient && thisIsTransient)
                return ReferenceEquals(other, this);

            return other.Id.Equals(Id);
        }

    }
}