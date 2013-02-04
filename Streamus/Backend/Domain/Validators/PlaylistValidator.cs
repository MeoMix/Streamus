using FluentValidation;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.Interfaces;

namespace Streamus.Backend.Domain.Validators
{
    public class PlaylistValidator : AbstractValidator<Playlist>
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();

        public PlaylistValidator()
        {
            RuleFor(playlist => playlist.Title).Length(0, 255);
            RuleFor(playlist => playlist.Position).GreaterThanOrEqualTo(0);
            RuleFor(playlist => playlist.Position).Must((playlist, position) => HasUniquePosition(playlist))
                                                  .WithMessage("There must be only one Playlist at a given position.");
        }

        private bool HasUniquePosition(Playlist playlist)
        {
            //  Ask the database for a playlist at the current position for the given user and make sure not going to overwrite something.
            Playlist fromDatabase = PlaylistDao.GetByPosition(playlist.UserId, playlist.Position);
            return fromDatabase == null || fromDatabase.Id == playlist.Id;
        }
    }
}