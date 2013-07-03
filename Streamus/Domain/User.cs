using FluentValidation;
using Streamus.Domain.Validators;
using System;
using System.Collections.Generic;

namespace Streamus.Domain
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        //  Use interfaces so NHibernate can inject with its own collection implementation.
        public IList<Stream> Streams { get; set; }

        public User()
        {
            Name = string.Empty;
            Streams = new List<Stream>();

            //  A user should always have at least one Stream.
            CreateStream();
        }

        public Stream CreateStream()
        {
            string title = string.Format("New Stream {0:D4}", Streams.Count);
            Stream stream = new Stream(title);
            return AddStream(stream);
        }

        public Stream AddStream(Stream stream)
        {
            stream.User = this;
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

        private int? _oldHashCode;
        public override int GetHashCode()
        {
            // Once we have a hash code we'll never change it
            if (_oldHashCode.HasValue)
                return _oldHashCode.Value;

            bool thisIsTransient = Equals(Id, Guid.Empty);

            // When this instance is transient, we use the base GetHashCode()
            // and remember it, so an instance can NEVER change its hash code.
            if (thisIsTransient)
            {
                _oldHashCode = base.GetHashCode();
                return _oldHashCode.Value;
            }
            return Id.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            User other = obj as User;
            if (other == null)
                return false;

            // handle the case of comparing two NEW objects
            bool otherIsTransient = Equals(other.Id, Guid.Empty);
            bool thisIsTransient = Equals(Id, Guid.Empty);
            if (otherIsTransient && thisIsTransient)
                return ReferenceEquals(other, this);

            return other.Id.Equals(Id);
        }
    }
}