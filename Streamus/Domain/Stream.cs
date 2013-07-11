using FluentValidation;
using Streamus.Domain.Validators;
using System;
using System.Collections.Generic;

namespace Streamus.Domain
{        
    //  TODO: Currently there is only the ability to have a single Stream.
    //  Should create Strean objects as a LinkedList so that adding and removing is possible.
    public class Stream : AbstractDomainEntity<Guid>
    {
        public string Title { get; set; }
        //  Use interfaces so NHibernate can inject with its own collection implementation.
        public ICollection<Playlist> Playlists { get; set; }
        public Playlist FirstPlaylist { get; set; }

        public Stream()
        {
            Id = Guid.Empty;
            Title = string.Empty;
            Playlists = new List<Playlist>();

            //  A stream should always have at least one Playlist.
            CreateAndAddPlaylist();
        }

        public Stream(string title) 
            : this()
        {
            Title = title;
        }

        public Playlist CreateAndAddPlaylist()
        {
            string title = string.Format("New Playlist {0:D4}", Playlists.Count);
            var playlist = new Playlist(title);

            AddPlaylist(playlist);

            return playlist;
        }

        public void AddPlaylist(Playlist playlist)
        {
            //  Playlist must be removed from other Stream before AddPlaylist affects it.
            if (playlist.Stream != null && playlist.Stream != this)
            {
                string message = string.Format("Playlist {0} is already a child of Stream {1}", playlist.Title, playlist.Stream.Title);
                throw new Exception(message);
            }

            if (Playlists.Count == 0)
            {
                FirstPlaylist = playlist;
                playlist.NextPlaylist = playlist;
                playlist.PreviousPlaylist = playlist;
            }
            else
            {
                Playlist firstPlayist = FirstPlaylist;
                Playlist lastPlaylist = firstPlayist.PreviousPlaylist;

                //  Adjust our linked list and add the item.
                lastPlaylist.NextPlaylist = playlist;
                playlist.PreviousPlaylist = lastPlaylist;

                firstPlayist.PreviousPlaylist = playlist;
                playlist.NextPlaylist = firstPlayist;
            }

            playlist.Stream = this;
            Playlists.Add(playlist);
        }

        public void RemovePlaylist(Playlist playlist)
        {
            if (FirstPlaylist == playlist)
            {
                FirstPlaylist = playlist.NextPlaylist;
            }

            Playlist previousPlaylist = playlist.PreviousPlaylist;
            Playlist nextPlaylist = playlist.NextPlaylist;

            //  Remove the list from our linked list.
            previousPlaylist.NextPlaylist = nextPlaylist;
            nextPlaylist.PreviousPlaylist = previousPlaylist;

            Playlists.Remove(playlist);
        }

        public void ValidateAndThrow()
        {
            var validator = new StreamValidator();
            validator.ValidateAndThrow(this);
        }

    }
}