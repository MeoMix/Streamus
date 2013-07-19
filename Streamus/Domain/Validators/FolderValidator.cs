using FluentValidation;

namespace Streamus.Domain.Validators
{
    public class FolderValidator : AbstractValidator<Folder>
    {
        public FolderValidator()
        {
            RuleFor(folder => folder.Title).Length(0, 255);
        }
    }
}