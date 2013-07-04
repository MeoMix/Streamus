using FluentValidation;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Validators;
using System;
using System.Collections.Generic;

namespace Streamus.Domain
{        
    //  TODO: Currently there is only the ability to have a single Stream.
    //  Should create Strean objects as a LinkedList so that adding and removing is possible.
    public class Stream : IAbstractDomainEntity
    {
        public Guid Id { get; set; }
        public User User { get; set; }
        public string Title { get; set; }
        //  Use interfaces so NHibernate can inject with its own collection implementation.
        public IList<Playlist> Playlists { get; set; }
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

        //  TODO: Not sure how I feel about this method.
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
                //  Move the firstListId to the next playlist
                FirstPlaylist = playlist.NextPlaylist;
            }

            Playlist previousList = playlist.PreviousPlaylist;
            Playlist nextList = playlist.NextPlaylist;

            //  Remove the list from our linked list.
            previousList.NextPlaylist = nextList;
            nextList.PreviousPlaylist = previousList;

            Playlists.Remove(playlist);
        }

        public void ValidateAndThrow()
        {
            var validator = new StreamValidator();
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
            Stream other = obj as Stream;
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