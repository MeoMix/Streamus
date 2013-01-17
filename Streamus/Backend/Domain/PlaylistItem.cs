using System;
using System.Runtime.Serialization;
using FluentValidation;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.DataInterfaces;

namespace Streamus.Backend.Domain
{
    [DataContract]
    public class PlaylistItem
    {
        [DataMember(Name = "playlistId")]
        public Guid PlaylistId { get; set; }

        [DataMember(Name = "position")]
        public int Position { get; set; }
        
        //Store Title on PlaylistItem as well as on Song because user might want to rename PlaylistItem.
        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "videoId")]
        public string VideoId { get; set; }

        public PlaylistItem()
        {
            PlaylistId = Guid.Empty;
            Position = -1;
            Title = string.Empty;
            VideoId = string.Empty;
        }

        public PlaylistItem(Guid playlistId, int position, string title, string videoId)
            : this()
        {
            PlaylistId = playlistId;
            Position = position;
            Title = title;
            VideoId = videoId;
        }

        public void CopyFromDetached(PlaylistItem detachedItem)
        {
            Title = detachedItem.Title;
            VideoId = detachedItem.VideoId;
        }

        public void ValidateAndThrow()
        {
            var validator = new PlaylistItemValidator();
            validator.ValidateAndThrow(this);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj.GetType() == GetType() && Equals((PlaylistItem) obj);
        }

        protected bool Equals(PlaylistItem other)
        {
            return PlaylistId.Equals(other.PlaylistId) && Position == other.Position;
        }

        /// <summary>
        /// Must be provided to properly compare two objects
        /// http://stackoverflow.com/questions/263400/what-is-the-best-algorithm-for-an-overridden-system-object-gethashcode
        /// </summary>
        public override int GetHashCode()
        {
            return (PlaylistId + "|" + Position).GetHashCode(); ;
        }
    }

    #region PlaylistItemValidator

    public class PlaylistItemValidator : AbstractValidator<PlaylistItem>
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly ISongDao SongDao = new SongDao();

        public PlaylistItemValidator()
        {
            RuleFor(playlistItem => playlistItem.PlaylistId).NotEqual(Guid.Empty);
            RuleFor(playlistItem => playlistItem.PlaylistId).Must(playlistId => PlaylistDao.GetById(playlistId) != null);
            RuleFor(playlistItem => playlistItem.VideoId).NotEqual(string.Empty);
            RuleFor(playlistItem => playlistItem.VideoId).Must(videoId => SongDao.GetByVideoId(videoId) != null);
            RuleFor(playlistItem => playlistItem.Position).GreaterThanOrEqualTo(0);
        }
    }

    #endregion
}