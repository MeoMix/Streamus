using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;

namespace Streamus.Dto
{
    public enum EntityType
    {
        None = -1,
        Video = 0,
        PlaylistItem = 1,
        Playlist = 2,
        Folder = 3,
        User = 4
    }

    public enum EntityAction
    {
        None = -1,
        Refresh = 0,
        Delete = 1
    }

    [DataContract]
    public class PushMessageDto
    {
        [DataMember(Name = "entityId")]
        public Guid EntityId { get; set; }

        [DataMember(Name = "entityType")]
        public EntityType EntityType { get; set; }

        [DataMember(Name = "entityAction")]
        public EntityAction EntityAction { get; set; }

        public PushMessageDto()
        {
            
        }

        public PushMessageDto(PlaylistItemDto dtoEntity)
        {
            //  TODO: Support various entity/entityActions
            EntityId = dtoEntity.PlaylistId;
            EntityType = EntityType.Playlist;
            EntityAction = EntityAction.Refresh;
        }

        public string ToJson()
        {
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(GetType());
            using (MemoryStream memoryStream = new MemoryStream())
            {
                serializer.WriteObject(memoryStream, this);
                return Encoding.Default.GetString(memoryStream.ToArray());
            }
        }

    }
}