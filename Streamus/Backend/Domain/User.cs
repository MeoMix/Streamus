using System;
using System.Runtime.Serialization;
using FluentValidation;

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
    }

    #region UserValidator

    public class UserValidator : AbstractValidator<User>
    {
        public UserValidator()
        {
            RuleFor(user => user.Name).Length(0, 255);
        }
    }

    #endregion
}