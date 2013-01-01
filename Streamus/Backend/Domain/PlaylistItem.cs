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
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "playlistId")]
        public Guid PlaylistId { get; set; }

        [DataMember(Name = "position")]
        public int Position { get; set; }

        [DataMember(Name = "songId")]
        public Guid SongId { get; set; }

        //I store these properties here for a couple of reasons:
        //A) I want to be able to support user-renamed titles in the future.
        //B) I want to be able to instantantaneously store and have access to these key features of a song
        //C) I can then load full data via songId -- second ajax request isn't unheard of for more data.
        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "videoId")]
        public string VideoId { get; set; }

        public PlaylistItem()
        {
        }

        public PlaylistItem(Guid playlistId, int position, Guid songId, string title, string videoId)
            : this()
        {
            PlaylistId = playlistId;
            Position = position;
            SongId = songId;
            Title = title;
            VideoId = videoId;
        }

        public void ValidateAndThrow()
        {
            var validator = new PlaylistItemValidator();
            validator.ValidateAndThrow(this);
        }
    }

    #region PlaylistItemValidator

    public class PlaylistItemValidator : AbstractValidator<PlaylistItem>
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly IPlaylistItemDao PlaylistItemDao = new PlaylistItemDao();
        private readonly ISongDao SongDao = new SongDao();

        public PlaylistItemValidator()
        {
            RuleFor(playlistItem => playlistItem.PlaylistId).NotEqual(Guid.Empty);
            RuleFor(playlistItem => playlistItem.PlaylistId).Must(playlistId => PlaylistDao.GetById(playlistId) != null);
            RuleFor(playlistItem => playlistItem.SongId).NotEqual(Guid.Empty);
            RuleFor(playlistItem => playlistItem.SongId).Must(songId => SongDao.GetById(songId) != null);
            //Make sure the position of the playlistItem is within the bounds.
            RuleFor(playlistItem => playlistItem.Position)
                .Must((playlistItem, position) => IsPositionWithinBounds(position, playlistItem.PlaylistId))
                .WithMessage("PlaylistItem's position not within expected bounds.");
            RuleFor(playlistItem => playlistItem.Position)
                .Must((playlistItem, position) => NullOrSame(position, playlistItem.PlaylistId, playlistItem.Id))
                .WithMessage("There must be only one PlaylistItem at a given position.");
        }

        private bool IsPositionWithinBounds(int position, Guid playlistId)
        {
            bool isWithinBounds = true;

            if (position < 0)
            {
                isWithinBounds = false;
            }
            else
            {
                Playlist playlist = PlaylistDao.GetById(playlistId);

                if (playlist != null)
                {
                    int playlistItemCount = PlaylistDao.GetById(playlistId).Items.Count;

                    if (position > playlistItemCount)
                    {
                        isWithinBounds = false;
                    }
                }
            }

            return isWithinBounds;
        }

        //Only allow saving of a playlistItem to a position that is free or if it is updating itself.
        private bool NullOrSame(int position, Guid playlistId, Guid id)
        {
            PlaylistItem playlistItem = PlaylistItemDao.GetByPosition(playlistId, position);
            return playlistItem == null || playlistItem.Id == id;
        }
    }

    #endregion
}