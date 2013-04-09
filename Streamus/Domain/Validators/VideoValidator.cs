using FluentValidation;

namespace Streamus.Domain.Validators
{
    public class VideoValidator : AbstractValidator<Video>
    {
        public VideoValidator()
        {
            RuleFor(video => video.Title).Length(0, 255);
            RuleFor(video => video.Id).Length(11);
        }
    }
}