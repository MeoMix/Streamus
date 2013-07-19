using System;
using System.Collections.Generic;
using AutoMapper;
using FluentValidation;
using Streamus.Domain.Validators;
using Streamus.Dto;

namespace Streamus.Domain
{
    public class User : AbstractDomainEntity<Guid>
    {
        public string Name { get; set; }
        //  Use interfaces so NHibernate can inject with its own collection implementation.
        public ICollection<Folder> Folders { get; set; }

        public User()
        {
            Name = string.Empty;
            Folders = new List<Folder>();

            //  A user should always have at least one Folder.
            CreateAndAddFolder();
        }

        public static User Create(UserDto userDto)
        {
            User user = Mapper.Map<UserDto, User>(userDto);
            return user;
        }

        public Folder CreateAndAddFolder()
        {
            string title = string.Format("New Folder {0:D4}", Folders.Count);
            Folder folder = new Folder(title)
                {
                    User = this
                };
            Folders.Add(folder);

            return folder;
        }

        public void RemoveFolder(Folder folder)
        {
            Folders.Remove(folder);
        }

        public void ValidateAndThrow()
        {
            var validator = new UserValidator();
            validator.ValidateAndThrow(this);
        }
    }
}