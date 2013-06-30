using System;
using FluentValidation;
using Streamus.Dao;
using Streamus.Domain.Interfaces;

namespace Streamus.Domain.Validators
{
    public class PlaylistItemValidator : AbstractValidator<PlaylistItem>
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();

        public PlaylistItemValidator()
        {
            RuleFor(playlistItem => playlistItem.Playlist).NotNull();
            RuleFor(playlistItem => playlistItem.Video).NotNull();
            RuleFor(playlistItem => playlistItem.NextItem).NotNull();
            RuleFor(playlistItem => playlistItem.PreviousItem).NotNull();
        }
    }
}