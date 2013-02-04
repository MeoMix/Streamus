using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using FluentValidation;
using Streamus.Backend.Domain.Validators;

namespace Streamus.Backend.Domain
{
    [DataContract]
    public class Playlist
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "userId")]
        public Guid UserId { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "position")]
        public int Position { get; set; }

        //Use collection interfaces instead of concrete collections, so NHibernate can inject it with its own collection implementation.
        [DataMember(Name = "items")]
        public IList<PlaylistItem> Items { get; set; }

        public Playlist()
        {
            Id = Guid.Empty;
            UserId = Guid.Empty;
            Title = string.Empty;
            Position = -1;
            Items = new List<PlaylistItem>();
        }

        public Playlist(Guid userId, string title)
            : this()
        {
            UserId = userId;
            Title = title;
        }

        public Playlist(Guid userId, string title, int position)
            : this(userId, title)
        {
            Position = position;
        }

        public void ValidateAndThrow()
        {
            var validator = new PlaylistValidator();
            validator.ValidateAndThrow(this);
        }

        /// <summary>
        ///     Must be provided to properly compare two objects
        ///     http://stackoverflow.com/questions/263400/what-is-the-best-algorithm-for-an-overridden-system-object-gethashcode
        /// </summary>
        public override int GetHashCode()
        {
            //  Overflow could happen, but that would be OK.
            unchecked
            {
                int hash = 17;
                hash = hash*23 + Position.GetHashCode();
                hash = hash*23 + Title.GetHashCode();
                hash = hash*23 + Id.GetHashCode();
                return hash;
            }
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj.GetType() == GetType() && Equals((Playlist) obj);
        }

        private bool Equals(Playlist other)
        {
            return Id.Equals(other.Id);
        }
    }
}