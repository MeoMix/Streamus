using AutoMapper;
using FluentValidation;
using Streamus.Domain.Validators;
using Streamus.Dto;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Streamus.Domain
{
    public class Playlist : AbstractShareableDomainEntity
    {
        public Folder Folder { get; set; }
        //  Use interfaces so NHibernate can inject with its own collection implementation.
        public ICollection<PlaylistItem> Items { get; set; }
        public PlaylistItem FirstItem { get; set; }
        public Playlist NextPlaylist { get; set; }
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

        public Playlist(Playlist playlist)
            : this()
        {
            Copy(playlist);
        }

        public static Playlist Create(PlaylistDto playlistDto)
        {
            Playlist playlist = Mapper.Map<PlaylistDto, Playlist>(playlistDto);
            return playlist;
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
                FirstItem = Items.Count == 1 ? null : playlistItem.NextItem;
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