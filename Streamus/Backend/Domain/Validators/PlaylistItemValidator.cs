using System;
using FluentValidation;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.Interfaces;

namespace Streamus.Backend.Domain.Validators
{
    public class PlaylistItemValidator : AbstractValidator<PlaylistItem>
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly IPlaylistItemDao PlaylistItemDao = new PlaylistItemDao();
        private readonly IVideoDao VideoDao = new VideoDao();

        public PlaylistItemValidator()
        {
            //  PlaylistItem's id should be provided by the client.
            RuleFor(playlistItem => playlistItem.Id).NotEqual(Guid.Empty);
            RuleFor(playlistItem => playlistItem.PlaylistId).NotEqual(Guid.Empty);
            RuleFor(playlistItem => playlistItem.PlaylistId).Must(playlistId => PlaylistDao.Get(playlistId) != null);
            RuleFor(playlistItem => playlistItem.VideoId).NotEqual(string.Empty);
            RuleFor(playlistItem => playlistItem.VideoId).Must(videoId => VideoDao.Get(videoId) != null);
            RuleFor(playlistItem => playlistItem.Position).GreaterThanOrEqualTo(0);
            RuleFor(playlistItem => playlistItem.Position)
                .Must((playlistItem, position) => HasUniquePosition(playlistItem))
                .WithMessage("There must be only one PlaylistItem at a given position.");
        }

        private bool HasUniquePosition(PlaylistItem playlistItem)
        {
            //  Ask the database for a playlistItem at the current position for the given user and make sure not going to overwrite something.
            PlaylistItem fromDatabase = PlaylistItemDao.GetByPosition(playlistItem.PlaylistId, playlistItem.Position);
            return fromDatabase == null || fromDatabase.Id == playlistItem.Id;
        }
    }
}