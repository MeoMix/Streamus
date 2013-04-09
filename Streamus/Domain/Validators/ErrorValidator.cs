using FluentValidation;

namespace Streamus.Domain.Validators
{
    public class ErrorValidator : AbstractValidator<Error>
    {
        public ErrorValidator()
        {
            RuleFor(error => error.Message).Length(0, 255);
            RuleFor(error => error.LineNumber).GreaterThan(-1);
            RuleFor(error => error.ClientVersion).Length(0, 255);
            RuleFor(error => error.Url).Length(0, 255);
        }
    }
}