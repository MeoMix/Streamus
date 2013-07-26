<<<<<<< HEAD
﻿using FluentValidation;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Validators;
using System;
using System.Runtime.Serialization;
=======
﻿using AutoMapper;
using FluentValidation;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Validators;
using System;
using Streamus.Dto;
>>>>>>> origin/Development

namespace Streamus.Domain
{
    public enum ShareableEntityType
    {
        None = -1,
        Playlist = 0
    }

<<<<<<< HEAD
    [DataContract]
    public class ShareCode
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "entity")]
        public ShareableEntityType EntityType { get; set; }

        [DataMember(Name = "entityId")]
        public Guid EntityId { get; set; }

        [DataMember(Name = "shortId")]
        public string ShortId { get; set; }

        [DataMember(Name = "urlFriendlyEntityTitle")]
=======
    public class ShareCode : AbstractDomainEntity<Guid>
    {
        public ShareableEntityType EntityType { get; set; }
        public Guid EntityId { get; set; }
        public string ShortId { get; set; }
>>>>>>> origin/Development
        public string UrlFriendlyEntityTitle { get; set; }

        public ShareCode()
        {
            Id = Guid.Empty;
            EntityId = Guid.Empty;
            EntityType = ShareableEntityType.None;
            ShortId = string.Empty;
            UrlFriendlyEntityTitle = string.Empty;
        }

        public ShareCode(IShareableEntity shareableEntity)
            : this()
        {
            if (shareableEntity is Playlist)
            {
                EntityType = ShareableEntityType.Playlist;
            }

            EntityId = shareableEntity.Id;
            UrlFriendlyEntityTitle = shareableEntity.GetUrlFriendlyTitle();
            ShortId = shareableEntity.GetShortId();
        }

<<<<<<< HEAD
        public void ValidateAndThrow()
        {
            var validator = new ShareCodeValidator();
            validator.ValidateAndThrow(this);
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
=======
        public static ShareCode Create(ShareCodeDto shareCodeDto)
        {
            ShareCode shareCode = Mapper.Map<ShareCodeDto, ShareCode>(shareCodeDto);
            return shareCode;
        }

        public void ValidateAndThrow()
        {
            var validator = new ShareCodeValidator();
            validator.ValidateAndThrow(this);
        }

>>>>>>> origin/Development
    }
}