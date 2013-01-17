using FluentValidation;
using System.Runtime.Serialization;

namespace Streamus.Backend.Domain
{
    [DataContract]
    public class Song
    {
        [DataMember(Name = "videoId")]
        public string VideoId { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "duration")]
        public int Duration { get; set; }

        public Song()
        {
            VideoId = string.Empty;
            Title = string.Empty;
        }

        public Song(string videoId, string title, int duration)
        {
            VideoId = videoId;
            Title = title;
            Duration = duration;
        }

        public void ValidateAndThrow()
        {
            var validator = new SongValidator();
            validator.ValidateAndThrow(this);
        }
    }

    #region SongValidator

    public class SongValidator : AbstractValidator<Song>
    {
        public SongValidator()
        {
            RuleFor(song => song.Title).Length(0, 255);
            RuleFor(song => song.VideoId).Length(11);
        }
    }

    #endregion
}