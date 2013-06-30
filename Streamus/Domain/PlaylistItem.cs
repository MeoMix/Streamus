using FluentValidation;
using System;
using System.Runtime.Serialization;
using Streamus.Dao;
using Streamus.Domain.Validators;

namespace Streamus.Domain
{
    [DataContract]
    public class PlaylistItem
    {
        [DataMember(Name = "playlistId")]
        public Guid PlaylistId
        {
            get
            {
                Guid playlistId = Guid.Empty;
                if (Playlist != null)
                {
                    playlistId = Playlist.Id;
                }

                return playlistId;
            }
            set
            {
                Playlist = new PlaylistDao().Get(value);
            }
        }

        public Playlist Playlist { get; set; }

        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "nextItemId")]
        public Guid NextItemId
        {
            get
            {
                Guid nextItemId = Guid.Empty;
                if (NextItem != null)
                {
                    nextItemId = NextItem.Id;
                }

                return nextItemId;
            }
            set { NextItem.Id = value; }
        }

        public PlaylistItem NextItem { get; set; }

        [DataMember(Name = "previousItemId")]
        public Guid PreviousItemId
        {
            get
            {
                Guid previousItemId = Guid.Empty;
                if (PreviousItem != null)
                {
                    previousItemId = PreviousItem.Id;
                }

                return previousItemId;
            }
            set { PreviousItem.Id = value; }
        }

        public PlaylistItem PreviousItem { get; set; }

        //  Store Title on PlaylistItem as well as on Video because user might want to rename PlaylistItem.
        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "video")]
        public Video Video { get; set; }

        public PlaylistItem()
        {
            Id = Guid.Empty;
            Title = string.Empty;
        }

        public PlaylistItem(string title, Video video)
            : this()
        {
            Title = title;
            Video = video;
        }

        public PlaylistItem(PlaylistItem playlistItem)
            : this()
        {
            Title = playlistItem.Title;
            Video = playlistItem.Video;
        }

        public void ValidateAndThrow()
        {
            var validator = new PlaylistItemValidator();
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
            PlaylistItem other = obj as PlaylistItem;
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