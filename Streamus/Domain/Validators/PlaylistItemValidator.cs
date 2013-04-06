using System;
using FluentValidation;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.Interfaces;

namespace Streamus.Backend.Domain.Validators
{
    public class PlaylistItemValidator : AbstractValidator<PlaylistItem>
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();

        public PlaylistItemValidator()
        {
            //  PlaylistItem's id should be provided by the client.
            RuleFor(playlistItem => playlistItem.Id).NotEqual(Guid.Empty);
            RuleFor(playlistItem => playlistItem.PlaylistId).NotEqual(Guid.Empty);
            RuleFor(playlistItem => playlistItem.PlaylistId).Must(playlistId => PlaylistDao.Get(playlistId) != null);
            RuleFor(playlistItem => playlistItem.Video).NotNull();
            RuleFor(playlistItem => playlistItem.NextItemId).NotEqual(Guid.Empty);
            RuleFor(playlistItem => playlistItem.PreviousItemId).NotEqual(Guid.Empty);
        }
    }
}