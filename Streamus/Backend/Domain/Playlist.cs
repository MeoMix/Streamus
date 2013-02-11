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

        //  TODO: This seems forced, but I can't get NHibernate to properly figure out the mapping without holding a reference.
        [DataMember(Name = "collectionId")]
        public Guid CollectionId
        {
            get { return Collection.Id; }
            set { Collection.Id = value; }
        }

        public PlaylistCollection Collection { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "position")]
        public int Position { get; set; }

        //  Use collection interfaces so NHibernate can inject with its own collection implementation.
        [DataMember(Name = "items")]
        public IList<PlaylistItem> Items { get; set; }

        public Playlist()
        {
            Id = Guid.Empty;
            Title = string.Empty;
            Position = -1;
            Items = new List<PlaylistItem>();
        }

        public Playlist(string title)
            : this()
        {
            Title = title;
        }

        public void RemoveItem(PlaylistItem playlistItem)
        {
            Items.Remove(playlistItem);
        }

        public void ValidateAndThrow()
        {
            var validator = new PlaylistValidator();
            validator.ValidateAndThrow(this);
        }

        private int? _oldHashCode;
        public override int GetHashCode()
        {
            //  Once we have a hash code we'll never change it
            if (_oldHashCode.HasValue)
                return _oldHashCode.Value;

            bool thisIsTransient = Equals(Id, Guid.Empty);

            //  When this instance is transient, we use the base GetHashCode()
            //  and remember it, so an instance can NEVER change its hash code.
            if (thisIsTransient)
            {
                _oldHashCode = base.GetHashCode();
                return _oldHashCode.Value;
            }
            return Id.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            Playlist other = obj as Playlist;
            if (other == null)
                return false;

            // Handle the case of comparing two NEW objects
            bool otherIsTransient = Equals(other.Id, Guid.Empty);
            bool thisIsTransient = Equals(Id, Guid.Empty);
            if (otherIsTransient && thisIsTransient)
                return ReferenceEquals(other, this);

            return other.Id.Equals(Id);
        }
    }
}