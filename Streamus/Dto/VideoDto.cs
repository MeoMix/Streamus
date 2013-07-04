using System.Collections.Generic;
using System.Runtime.Serialization;
using AutoMapper;
using Streamus.Domain;

namespace Streamus.Dto
{
    [DataContract]
    public class VideoDto
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "duration")]
        public int Duration { get; set; }

        [DataMember(Name = "author")]
        public string Author { get; set; }

        public VideoDto()
        {
            Id = string.Empty;
            Title = string.Empty;
            Author = string.Empty;
        }

        /// <summary>
        /// Converts a Domain object to a DTO
        /// </summary>
        public static VideoDto Create(Video video)
        {
            VideoDto videoDto = Mapper.Map<Video, VideoDto>(video);
            return videoDto;
        }

        public static List<VideoDto> Create(IEnumerable<Video> videos)
        {
            List<VideoDto> videoDtos = Mapper.Map<IEnumerable<Video>, List<VideoDto>>(videos);
            return videoDtos;
        }
    }
}