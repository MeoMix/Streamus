using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using FluentValidation;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.DataInterfaces;

namespace Streamus.Backend.Domain
{
    [DataContract]
    public class Playlist
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }
        [DataMember(Name = "userId")]
        public Guid UserId { get; set; }
        [DataMember(Name = "title")]
        public string Title { get; set; }
        [DataMember(Name = "position")]
        public int Position { get; set; }
        //Use collection interfaces instead of concrete collections, so NHibernate can inject it with its own collection implementation.
        [DataMember(Name = "items")]
        public IList<PlaylistItem> Items { get; set; }

        public Playlist()
        {
            Title = string.Empty;
            Items = new List<PlaylistItem>();
        }

        public Playlist(Guid userId, string title) 
            : this()
        {
            UserId = userId;
            Title = title;
        }

        public Playlist(Guid userId, string title, int position)
            : this(userId, title)
        {
            Position = position;
        }

        public void ValidateAndThrow()
        {
            var validator = new PlaylistValidator();
            validator.ValidateAndThrow(this);
        }        
        
        /// <summary>
        /// Must be provided to properly compare two objects
        /// </summary>
        public override int GetHashCode()
        {
            return Title.Length * 251 + Items.Count;
        }

        public override sealed bool Equals(object obj)
        {
            Playlist compareTo = obj as Playlist;

            return (compareTo != null) && Position == compareTo.Position;
        }
    }

    #region PlaylistValidator
    public class PlaylistValidator : AbstractValidator<Playlist>
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();

        public PlaylistValidator()
        {
            RuleFor(playlist => playlist.Title).Length(0, 255);
            RuleFor(playlist => playlist.Position).GreaterThanOrEqualTo(0);
            RuleFor(playlist => playlist.Position).Must((playlist, position) => HasUniquePosition(playlist))
                .WithMessage(string.Format("There must be only one Playlist at this position."));
        }

        private bool HasUniquePosition(Playlist playlist)
        {
            //Ask the database for a playlist at the current position for the given user and make sure not going to overwrite something.
            Playlist fromDatabase = PlaylistDao.GetByPosition(playlist.UserId, playlist.Position);
            return fromDatabase == null || fromDatabase.Id == playlist.Id;
        }
    }
    #endregion
}