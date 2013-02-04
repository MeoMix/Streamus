using System;
using System.Runtime.Serialization;
using FluentValidation;
using Streamus.Backend.Domain.Validators;

namespace Streamus.Backend.Domain
{
    [DataContract]
    public class User
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        public User()
        {
            Name = string.Empty;
        }

        public void ValidateAndThrow()
        {
            var validator = new UserValidator();
            validator.ValidateAndThrow(this);
        }

        //  TODO: Need to implement Equals() and GetHashCode()
    }
}