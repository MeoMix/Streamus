using System;
using System.Runtime.Serialization;

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

        public PlaylistItemDto()
        {
            Id = Guid.Empty;
            Title = string.Empty;
        }

        public PlaylistItemDto(string title, VideoDto video)
            : this()
        {
            Title = title;
            Video = video;
        }

        public PlaylistItemDto(PlaylistItemDto playlistItem)
            : this()
        {
            Title = playlistItem.Title;
            Video = playlistItem.Video;
        }
    }
}