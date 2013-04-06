using FluentValidation;

namespace Streamus.Backend.Domain.Validators
{
    public class UserValidator : AbstractValidator<User>
    {
        public UserValidator()
        {
            RuleFor(user => user.Name).Length(0, 255);
        }
    }
}