using System.Collections.Generic;
using AutoMapper;
using FluentValidation;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Validators;
using System;
using Streamus.Dto;

namespace Streamus.Domain
{
    public class PlaylistItem : IAbstractDomainEntity
    {
        public Playlist Playlist { get; set; }
        public Guid Id { get; set; }
        public PlaylistItem NextItem { get; set; }
        public PlaylistItem PreviousItem { get; set; }
        public string Title { get; set; }
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

        public static PlaylistItem Create(PlaylistItemDto playlistItemDto)
        {
            PlaylistItem playlistItem = Mapper.Map<PlaylistItemDto, PlaylistItem>(playlistItemDto);
            return playlistItem;
        }

        public static List<PlaylistItem> Create(IEnumerable<PlaylistItemDto> playlistItemDtos)
        {
            List<PlaylistItem> playlistItems = Mapper.Map<IEnumerable<PlaylistItemDto>, List<PlaylistItem>>(playlistItemDtos);
            return playlistItems;
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