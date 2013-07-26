using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using AutoMapper;
using Streamus.Domain;

namespace Streamus.Dto
{
    [DataContract]
    public class PlaylistItemDto
    {
        [DataMember(Name = "playlistId")]
        public Guid PlaylistId { get; set; }

        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "nextItemId")]
        public Guid NextItemId { get; set; }

        [DataMember(Name = "previousItemId")]
        public Guid PreviousItemId { get; set; }

        //  Store Title on PlaylistItem as well as on Video because user might want to rename PlaylistItem.
        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "video")]
        public VideoDto Video { get; set; }

        [DataMember(Name = "cid")]
        public string Cid { get; set; }

        public PlaylistItemDto()
        {
            Id = Guid.Empty;
            Title = string.Empty;
        }

        public static PlaylistItemDto Create(PlaylistItem playlistItem)
        {
            PlaylistItemDto playlistItemDto = Mapper.Map<PlaylistItem, PlaylistItemDto>(playlistItem);
            return playlistItemDto;
        }

        public static List<PlaylistItemDto> Create(IEnumerable<PlaylistItem> playlistItems)
        {
            List<PlaylistItemDto> playlistItemDtos = Mapper.Map<IEnumerable<PlaylistItem>, List<PlaylistItemDto>>(playlistItems);
            return playlistItemDtos;
        }
    }
}