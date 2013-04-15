using System.Web.Script.Serialization;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using Streamus.Domain.Validators;

namespace Streamus.Domain
{        
    //  TODO: Currently there is only the ability to have a single Stream.
    //  Should create Strean objects as a LinkedList so that adding and removing is possible.
    [DataContract]
    public class Stream
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "userId")]
        public Guid UserId
        {
            get { return User.Id; }
            set { User.Id = value; }
        }

        public User User { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        //  Use interfaces so NHibernate can inject with its own collection implementation.
        [DataMember(Name = "playlists")]
        public IList<Playlist> Playlists { get; set; }

        [DataMember(Name = "firstListId")]
        public Guid FirstListId
        {
            get { return FirstPlaylist.Id; }
            set { FirstPlaylist.Id = value; }
        }

        public Playlist FirstPlaylist { get; set; }

        public Stream()
        {
            Id = Guid.Empty;
            Title = string.Empty;
            Playlists = new List<Playlist>();

            //  A stream should always have at least one Playlist.
            CreatePlaylist();
        }

        public Stream(string title) 
            : this()
        {
            Title = title;
        }

        public Playlist CreatePlaylist()
        {
            string title = string.Format("New Playlist {0:D4}", Playlists.Count);
            var playlist = new Playlist(title);
            return AddPlaylist(playlist);
        }

        public Playlist AddPlaylist(Playlist playlist)
        {
            if (Playlists.Count == 0)
            {
                FirstPlaylist = playlist;
                playlist.NextPlaylist = playlist;
                playlist.PreviousPlaylist = playlist;
            }
            else
            {
                //Playlist firstList = Playlists.First(list => list.Id == FirstListId);
                Playlist firstList = FirstPlaylist;
                Playlist lastList = Playlists.First(list => list.Id == firstList.PreviousListId);

                //  Adjust our linked list and add the item.
                lastList.NextPlaylist = playlist;
                playlist.PreviousPlaylist = lastList;

                firstList.PreviousPlaylist = playlist;
                playlist.NextPlaylist = firstList;
            }

            playlist.Stream = this;

            Playlists.Add(playlist);
            return playlist;
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