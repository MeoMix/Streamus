using System;
using System.Runtime.Serialization;
using AutoMapper;
using Streamus.Domain;

namespace Streamus.Dto
{
    [DataContract]
    public class ErrorDto
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "message")]
        public string Message { get; set; }

        [DataMember(Name = "lineNumber")]
        public int LineNumber { get; set; }

        [DataMember(Name = "url")]
        public string Url { get; set; }

        [DataMember(Name = "clientVersion")]
        public string ClientVersion { get; set; }

        [DataMember(Name = "timeOccurred")]
        public DateTime TimeOccurred { get; set; }

        public ErrorDto()
        {
            Message = string.Empty;
            LineNumber = -1;
            Url = string.Empty;
            ClientVersion = string.Empty;
            TimeOccurred = DateTime.Now;
        }

        public static ErrorDto Create(Error error)
        {
            ErrorDto errorDto = Mapper.Map<Error, ErrorDto>(error);
            return errorDto;
        }
    }
}