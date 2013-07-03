using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Streamus.Dto
{
    [DataContract]
    public class StreamDto
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "userId")]
        public Guid UserId { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "playlists")]
        public List<PlaylistDto> Playlists { get; set; }

        //  TODO: Change DataMember to firstPlaylistId when I have the time.
        [DataMember(Name = "firstListId")]
        public Guid FirstPlaylistId { get; set; }

        public StreamDto()
        {
            Id = Guid.Empty;
            Title = string.Empty;
            Playlists = new List<PlaylistDto>();
        }

        public StreamDto(string title)
            : this()
        {
            Title = title;
        }
    }
}