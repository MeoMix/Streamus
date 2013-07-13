using AutoMapper;
using Streamus.Domain;
using System;
using System.Runtime.Serialization;

namespace Streamus.Dto
{
    [DataContract]
    public class ShareCodeDto
    {
        [DataMember(Name = "id")]
        public Guid Id { get; set; }

        [DataMember(Name = "entity")]
        public ShareableEntityType EntityType { get; set; }

        [DataMember(Name = "entityId")]
        public Guid EntityId { get; set; }

        [DataMember(Name = "shortId")]
        public string ShortId { get; set; }

        [DataMember(Name = "urlFriendlyEntityTitle")]
        public string UrlFriendlyEntityTitle { get; set; }

        public ShareCodeDto()
        {
            Id = Guid.Empty;
            EntityId = Guid.Empty;
            EntityType = ShareableEntityType.None;
            ShortId = string.Empty;
            UrlFriendlyEntityTitle = string.Empty;
        }

        public static ShareCodeDto Create(ShareCode shareCode)
        {
            ShareCodeDto shareCodeDto = Mapper.Map<ShareCode, ShareCodeDto>(shareCode);
            return shareCodeDto;
        }
    }
}