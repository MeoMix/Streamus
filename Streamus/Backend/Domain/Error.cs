using System;
using FluentValidation;
using Streamus.Backend.Domain.Validators;
using System.Runtime.Serialization;

namespace Streamus.Backend.Domain
{
    [DataContract]
    public class Error
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "message")]
        public string Message { get; set; }

        [DataMember(Name = "lineNumber")]
        public string LineNumber { get; set; }

        [DataMember(Name = "url")]
        public string Url { get; set; }

        [DataMember(Name = "clientVersion")]
        public string ClientVersion { get; set; }

        [DataMember(Name = "timeOccurred")]
        public string TimeOccurred { get; set; }

        public Error()
        {
            Message = string.Empty;
            LineNumber = string.Empty;
            Url = string.Empty;
            ClientVersion = string.Empty;
            TimeOccurred = string.Empty;
        }

        public void ValidateAndThrow()
        {
            var validator = new ErrorValidator();
            validator.ValidateAndThrow(this);
        }
    }
}