using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using FluentValidation;
using Streamus.Backend.Dao;
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
            get
            {
                Guid collectionId = Guid.Empty;
                if (Collection != null)
                {
                    collectionId = Collection.Id;
                }

                return collectionId;
            }
            set
            {
                Collection = new PlaylistCollectionDao().Get(value);
            }
        }

        public PlaylistCollection Collection { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        //  Use collection interfaces so NHibernate can inject with its own collection implementation.
        [DataMember(Name = "items")]
        public IList<PlaylistItem> Items { get; set; }

        [DataMember(Name = "firstItemId")]
        public Guid FirstItemId { get; set; }

        [DataMember(Name = "nextListId")]
        public Guid NextListId { get; set; }

        [DataMember(Name = "previousListId")]
        public Guid PreviousListId { get; set; }

        public Playlist()
        {
            Id = Guid.Empty;
            FirstItemId = Guid.Empty;
            NextListId = Guid.Empty;
            PreviousListId = Guid.Empty;
            Title = string.Empty;
            Items = new List<PlaylistItem>();
        }

        public Playlist(string title)
            : this()
        {
            Title = title;
        }

        public void AddItem(PlaylistItem playlistItem)
        {
            if (Items.Count == 0)
            {
                playlistItem.NextItemId = playlistItem.Id;
                playlistItem.PreviousItemId = playlistItem.Id;
                FirstItemId = playlistItem.Id;
            }
            else
            {

                PlaylistItem firstItem = Items.First(item => item.Id == FirstItemId);
                PlaylistItem lastItem = Items.First(item => item.Id == firstItem.PreviousItemId);

                //  Adjust our linked list and add the item.
                lastItem.NextItemId = playlistItem.Id;
                playlistItem.PreviousItemId = lastItem.Id;

                firstItem.PreviousItemId = playlistItem.Id;
                playlistItem.NextItemId = firstItem.Id;
            }

            Items.Add(playlistItem);
        }

        public void RemoveItem(PlaylistItem playlistItem)
        {
            if (FirstItemId == playlistItem.Id)
            {
                //  Move the firstItemId to the next item if playlist still has other items in it.
                FirstItemId = Items.Count == 1 ? Guid.Empty : playlistItem.NextItemId;
            }

            PlaylistItem previousItem = Items.First(item => item.Id == playlistItem.PreviousItemId);
            PlaylistItem nextItem = Items.First(item => item.Id == playlistItem.NextItemId);

            //  Remove the item from our linked list.
            previousItem.NextItemId = nextItem.Id;
            nextItem.PreviousItemId = previousItem.Id;

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