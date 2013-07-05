using AutoMapper;
using Streamus.Domain;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Streamus.Dto
{    
    //  TODO: Not sure about AbstractShareableEntity
    [DataContract]
    public class PlaylistDto : AbstractShareableEntity 
    {        
        [DataMember(Name = "streamId")]
        public Guid StreamId { get; set; }

        [DataMember(Name = "items")]
        public List<PlaylistItemDto> Items { get; set; }

        [DataMember(Name = "firstItemId")]
        public Guid FirstItemId { get; set; }

        [DataMember(Name = "nextPlaylistId")]
        public Guid NextPlaylistId { get; set; }

        [DataMember(Name = "previousPlaylistId")]
        public Guid PreviousPlaylistId { get; set; }

        public PlaylistDto()
        {
            Id = Guid.Empty;
            Title = string.Empty;
            FirstItemId = Guid.Empty;
            NextPlaylistId = Guid.Empty;
            PreviousPlaylistId = Guid.Empty;
            Items = new List<PlaylistItemDto>();
        }

        public static PlaylistDto Create(Playlist playlist)
        {
            PlaylistDto playlistDto = Mapper.Map<Playlist, PlaylistDto>(playlist);
            return playlistDto;
        }
    }
}