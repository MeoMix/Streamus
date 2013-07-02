using FluentValidation;
using Streamus.Dao;
using Streamus.Domain.Validators;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace Streamus.Domain
{
    [DataContract]
    public class Playlist : AbstractShareableEntity
    {
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

        //  Use interfaces so NHibernate can inject with its own collection implementation.
        [DataMember(Name = "items")]
        public IList<PlaylistItem> Items { get; set; }

        //  TODO: I think if I extract all of the ID properties into DTO classes I can get rid of this uglyness.
        [DataMember(Name = "firstItemId")]
        public Guid FirstItemId
        {
            get
            {
                return FirstItem != null ? FirstItem.Id : default(Guid);
            }
            set
            {
                if (value == default(Guid))
                {
                    FirstItem = null;
                }
                else
                {
                    FirstItem.Id = value;
                }
                
            }
        }

        public PlaylistItem FirstItem { get; set; }

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
                if (playlistItem == playlist.FirstItem)
                {
                    FirstItem = shareableItemCopy;
                }
            }
        }

        public void AddItem(PlaylistItem playlistItem)
        {
            //  Item must be removed from other Playlist before AddItem affects it.
            if (playlistItem.Playlist != null && playlistItem.Playlist != this)
            {
                string message = string.Format("Item {0} is already a child of Playlist {1}", playlistItem.Title, playlistItem.Playlist.Title);
                throw new Exception(message);
            }

            if (Items.Count == 0)
            {
                FirstItem = playlistItem;
                playlistItem.NextItem = playlistItem;
                playlistItem.PreviousItem = playlistItem;
            }
            else
            {
                PlaylistItem firstItem = FirstItem;
                PlaylistItem lastItem = firstItem.PreviousItem;

                //  Adjust our linked list and add the item.
                lastItem.NextItem = playlistItem;
                playlistItem.PreviousItem = lastItem;

                firstItem.PreviousItem = playlistItem;
                playlistItem.NextItem = firstItem;
            }

            playlistItem.Playlist = this;
            Items.Add(playlistItem);
        }

        public void AddItems(IEnumerable<PlaylistItem> playlistItems)
        {
            playlistItems.ToList().ForEach(AddItem);
        }

        public void RemoveItem(PlaylistItem playlistItem)
        {
            if (FirstItem == playlistItem)
            {
                //  Move the firstItemId to the next item if playlist still has other items in it.
                FirstItem = Items.Count > 1 ? playlistItem.NextItem : null;
            }

            PlaylistItem previousItem = playlistItem.PreviousItem;
            PlaylistItem nextItem = playlistItem.NextItem;

            //  Remove the item from our linked list.
            previousItem.NextItem = nextItem;
            nextItem.PreviousItem = previousItem;

            Items.Remove(playlistItem);
        }

        public void ValidateAndThrow()
        {
            var validator = new PlaylistValidator();
            validator.ValidateAndThrow(this);
        }
    }
}