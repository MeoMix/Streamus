using FluentValidation;

namespace Streamus.Domain.Validators
{
    public class UserValidator : AbstractValidator<User>
    {
        public UserValidator()
        {
            RuleFor(user => user.Name).Length(0, 255);
        }
    }
}