using FluentValidation;
using System.Runtime.Serialization;

namespace Streamus.Backend.Domain
{
    [DataContract]
    public class Video
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "duration")]
        public int Duration { get; set; }

        public Video()
        {
            Id = string.Empty;
            Title = string.Empty;
        }

        public Video(string id, string title, int duration)
        {
            Id = id;
            Title = title;
            Duration = duration;
        }

        public void ValidateAndThrow()
        {
            var validator = new VideoValidator();
            validator.ValidateAndThrow(this);
        }
    }

    #region VideoValidator

    public class VideoValidator : AbstractValidator<Video>
    {
        public VideoValidator()
        {
            RuleFor(video => video.Title).Length(0, 255);
            RuleFor(video => video.Id).Length(11);
        }
    }

    #endregion
}