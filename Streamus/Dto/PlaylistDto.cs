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

        //  TODO: Rename to nextPlaylistId when I have time.
        [DataMember(Name = "nextListId")]
        public Guid NextPlaylistId { get; set; }

        //  TODO: Rename to previousPlaylistId when I have time.
        [DataMember(Name = "previousListId")]
        public Guid PreviousPlaylistId { get; set; }

        public PlaylistDto()
        {
            Id = Guid.Empty;
            Title = string.Empty;
            Items = new List<PlaylistItemDto>();
        }

        public PlaylistDto(string title)
            : this()
        {
            Title = title;
        }

    }
}