using FluentValidation;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Streamus.Domain.Validators;

namespace Streamus.Domain
{
    public enum ShareableEntityType
    {
        None = -1,
        Playlist = 0
    }

    [DataContract]
    public class ShareCode
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "entity")]
        public ShareableEntityType EntityType { get; set; }

        [DataMember(Name = "entityId")]
        public Guid EntityId { get; set; }

        public ShareCode()
        {
            Id = Guid.Empty;
            EntityId = Guid.Empty;
            EntityType = ShareableEntityType.None;
        }

        public ShareCode(ShareableEntityType entityType, Guid entityId) 
            : this ()
        {
            EntityType = entityType;
            EntityId = entityId;
        }

        public void ValidateAndThrow()
        {
            var validator = new ShareCodeValidator();
            validator.ValidateAndThrow(this);
        }

        public new string ToString()
        {
            return Id.ToString();
        }

        private int? _oldHashCode;
        public override int GetHashCode()
        {
            // Once we have a hash code we'll never change it
            if (_oldHashCode.HasValue)
                return _oldHashCode.Value;

            bool thisIsTransient = Equals(Id, Guid.Empty);

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
            User other = obj as User;
            if (other == null)
                return false;

            // handle the case of comparing two NEW objects
            bool otherIsTransient = Equals(other.Id, Guid.Empty);
            bool thisIsTransient = Equals(Id, Guid.Empty);
            if (otherIsTransient && thisIsTransient)
                return ReferenceEquals(other, this);

            return other.Id.Equals(Id);
        }
    }
}