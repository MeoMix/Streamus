using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using Streamus.Dao;
using Streamus.Domain.Validators;

namespace Streamus.Domain
{
    [DataContract]
    public class Playlist
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        //  TODO: This seems forced, but I can't get NHibernate to properly figure out the mapping without holding a reference.
        [DataMember(Name = "streamId")]
        public Guid StreamId
        {
            get
            {
                Guid streamId = Guid.Empty;
                if (Stream != null)
                {
                    streamId = Stream.Id;
                }

                return streamId;
            }
            set
            {
                Stream = new StreamDao().Get(value);
            }
        }

        public Stream Stream { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        //  Use interfaces so NHibernate can inject with its own collection implementation.
        [DataMember(Name = "items")]
        public IList<PlaylistItem> Items { get; set; }

        [DataMember(Name = "firstItemId")]
        public Guid FirstItemId { get; set; }

        [DataMember(Name = "nextListId")]
        public Guid NextListId
        {
            get
            {
                Guid nextListId = Guid.Empty;
                if (NextPlaylist != null)
                {
                    nextListId = NextPlaylist.Id;
                }

                return nextListId;
            }
            set { NextPlaylist.Id = value; }
        }

        public Playlist NextPlaylist { get; set; }

        [DataMember(Name = "previousListId")]
        public Guid PreviousListId
        {
            get
            {
                Guid previousListId = Guid.Empty;
                if (PreviousPlaylist != null)
                {
                    previousListId = PreviousPlaylist.Id;
                }

                return previousListId;
            }
            set { PreviousPlaylist.Id = value; }
        }

        public Playlist PreviousPlaylist { get; set; }

        public Playlist()
        {
            Id = Guid.Empty;
            FirstItemId = Guid.Empty;
            Title = string.Empty;
            Items = new List<PlaylistItem>();
        }

        public Playlist(string title)
            : this()
        {
            Title = title;
        }

        public void Copy(Playlist playlist)
        {
            Title = playlist.Title;

            foreach (PlaylistItem playlistItem in playlist.Items)
            {
                PlaylistItem shareableItemCopy = new PlaylistItem(playlistItem);
                AddItem(shareableItemCopy);

                //  If the old playlist's firstItemId was the currently old item we're iterating over,
                //  set the current new item as the first item.
                if (playlistItem.Id == playlist.FirstItemId)
                {
                    FirstItemId = shareableItemCopy.Id;
                }
            }
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

            playlistItem.PlaylistId = Id;
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