using System.Runtime.Serialization;

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

        public VideoDto(string id, string title, int duration, string author)
        {
            Id = id;
            Title = title;
            Duration = duration;
            Author = author;
        }
    }
}