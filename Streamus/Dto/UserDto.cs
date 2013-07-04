using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using AutoMapper;
using Streamus.Domain;

namespace Streamus.Dto
{
    [DataContract]
    public class UserDto
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "streams")]
        public List<StreamDto> Streams { get; set; }

        public UserDto()
        {
            Name = string.Empty;
            Streams = new List<StreamDto>();
        }

        public static UserDto Create(User user)
        {
            UserDto userDto = Mapper.Map<User, UserDto>(user);
            return userDto;
        }

    }
}