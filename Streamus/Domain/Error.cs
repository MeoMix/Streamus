using AutoMapper;
using FluentValidation;
using Streamus.Domain.Validators;
using Streamus.Dto;
using System;

namespace Streamus.Domain
{
    public class Error : AbstractDomainEntity<Guid>
    {
        public string Message { get; set; }
        public int LineNumber { get; set; }
        public string Url { get; set; }
        public string ClientVersion { get; set; }
        public DateTime TimeOccurred { get; set; }

        public Error()
        {
            Message = string.Empty;
            LineNumber = -1;
            Url = string.Empty;
            ClientVersion = string.Empty;
            TimeOccurred = DateTime.Now;
        }

        public static Error Create(ErrorDto errorDto)
        {
            Error error = Mapper.Map<ErrorDto, Error>(errorDto);
            return error;
        }

        public void ValidateAndThrow()
        {
            var validator = new ErrorValidator();
            validator.ValidateAndThrow(this);
        }
    }
}