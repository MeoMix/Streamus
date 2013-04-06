using System.Runtime.Serialization;
using FluentValidation;
using Streamus.Backend.Domain.Validators;
using System;

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

        public override int GetHashCode()
        {
            bool thisIsTransient = Equals(Id, string.Empty);

            if (thisIsTransient)
            {
                throw new ApplicationException("Video should never be transient.");
            }

            return Id.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            Video other = obj as Video;
            if (other == null)
                return false;

            // handle the case of comparing two NEW objects
            bool otherIsTransient = Equals(other.Id, string.Empty);
            bool thisIsTransient = Equals(Id, string.Empty);
            if (otherIsTransient || thisIsTransient)
            {
                throw new ApplicationException("Video should never be transient.");
            }

            return other.Id.Equals(Id);
        }
    }
}