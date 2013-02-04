using System.Runtime.Serialization;
using FluentValidation;
using Streamus.Backend.Domain.Validators;

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

        //  TODO: Need to implement Equals() and GetHashCode()
    }
}