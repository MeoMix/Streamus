using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Streamus.Dto
{
    [DataContract]
    public class FolderDto
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "playlists")]
        public List<PlaylistDto> Playlists { get; set; }

        [DataMember(Name = "firstPlaylistId")]
        public Guid FirstPlaylistId { get; set; }

        [DataMember(Name = "userId")]
        public Guid UserId { get; set; }

        public FolderDto()
        {
            Id = Guid.Empty;
            FirstPlaylistId = Guid.Empty;
            UserId = Guid.Empty;
            Title = string.Empty;
            Playlists = new List<PlaylistDto>();
        }

        public FolderDto(string title)
            : this()
        {
            Title = title;
        }
    }
}