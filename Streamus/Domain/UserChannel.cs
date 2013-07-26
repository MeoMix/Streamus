using System;
using System.Collections.Generic;

namespace Streamus.Domain
{
    /// <summary>
    /// Maintains an association between a given user's ID and all of the active Channels for that User.
    /// An active channel is a device running Streamus -- so if 3 PCs are logged in as one user, 3 channels for 1 user ID.
    /// </summary>
    public class UserChannel
    {
        public Guid UserId { get; set; }
        public List<string> ChannelIds { get; set; }

        public UserChannel(Guid userId, List<string> channelIds)
        {
            UserId = userId;
            ChannelIds = channelIds;
        }
    }
}