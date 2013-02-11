using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using FluentValidation;

namespace Streamus.Backend.Domain.Validators
{
    public class PlaylistCollectionValidator : AbstractValidator<PlaylistCollection>
    {
        public PlaylistCollectionValidator()
        {
            RuleFor(playlistCollection => playlistCollection.Title).Length(0, 255);
        }
    }
}