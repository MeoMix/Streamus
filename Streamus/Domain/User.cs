using AutoMapper;
using FluentValidation;
using Streamus.Domain.Validators;
using Streamus.Dto;
using System;
using System.Collections.Generic;

namespace Streamus.Domain
{
    public class User : AbstractDomainEntity<Guid>
    {
        public string Name { get; set; }
        //  Use interfaces so NHibernate can inject with its own collection implementation.
        public IList<Stream> Streams { get; set; }

        public User()
        {
            Name = string.Empty;
            Streams = new List<Stream>();

            //  A user should always have at least one Stream.
            CreateAndAddStream();
        }

        public static User Create(UserDto userDto)
        {
            User user = Mapper.Map<UserDto, User>(userDto);
            return user;
        }

        public Stream CreateAndAddStream()
        {
            string title = string.Format("New Stream {0:D4}", Streams.Count);
            var stream = new Stream(title);
            Streams.Add(stream);

            return stream;
        }

        public void RemoveStream(Stream stream)
        {
            Streams.Remove(stream);
        }

        public void ValidateAndThrow()
        {
            var validator = new UserValidator();
            validator.ValidateAndThrow(this);
        }

    }
}