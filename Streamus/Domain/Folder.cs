using FluentValidation;
using Streamus.Domain.Validators;
using System;
using System.Collections.Generic;

namespace Streamus.Domain
{        
    //  TODO: Currently there is only the ability to have a single Folder.
    //  Should create Strean objects as a LinkedList so that adding and removing is possible.
    public class Folder : AbstractDomainEntity<Guid>
    {
        public virtual string Title { get; set; }
        //  Use interfaces so NHibernate can inject with its own collection implementation.
        public virtual ICollection<Playlist> Playlists { get; set; }
        public virtual Playlist FirstPlaylist { get; set; }
        public virtual User User { get; set; }

        public Folder()
        {
            Id = Guid.Empty;
            Title = string.Empty;
            Playlists = new List<Playlist>();

            //  A Folder should always have at least one Playlist.
            CreateAndAddPlaylist();
        }

        public Folder(string title) 
            : this()
        {
            Title = title;
        }

        public virtual Playlist CreateAndAddPlaylist()
        {
            string title = string.Format("New Playlist {0:D4}", Playlists.Count);
            var playlist = new Playlist(title);

            AddPlaylist(playlist);

            return playlist;
        }

        public virtual void AddPlaylist(Playlist playlist)
        {
            //  Playlist must be removed from other Folder before AddPlaylist affects it.
            if (playlist.Folder != null && playlist.Folder.Id != Id)
            {
                string message = string.Format("Playlist {0} is already a child of Folder {1}", playlist.Title, playlist.Folder.Title);
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

            playlist.Folder = this;
            Playlists.Add(playlist);
        }

        public virtual void RemovePlaylist(Playlist playlist)
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

        public virtual void ValidateAndThrow()
        {
            var validator = new FolderValidator();
            validator.ValidateAndThrow(this);
        }

    }
}