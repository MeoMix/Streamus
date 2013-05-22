using System;
using FluentValidation;

namespace Streamus.Domain.Validators
{
    public class ShareCodeValidator : AbstractValidator<ShareCode>
    {
        public ShareCodeValidator()
        {
            RuleFor(shareCode => shareCode.EntityType).NotEqual(ShareableEntityType.None);
            RuleFor(shareCode => shareCode.EntityId).NotEqual(Guid.Empty);
        }
    }
}