using FluentValidation;

namespace Streamus.Backend.Domain.Validators
{
    public class ErrorValidator : AbstractValidator<Error>
    {
        public ErrorValidator()
        {
            RuleFor(error => error.Message).Length(0, 255);
            RuleFor(error => error.LineNumber).Length(0, 255);
            RuleFor(error => error.TimeOccurred).Length(0, 255);
            RuleFor(error => error.ClientVersion).Length(0, 255);
            RuleFor(error => error.Url).Length(0, 255);
        }
    }
}