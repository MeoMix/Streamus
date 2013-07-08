using System;
using System.Collections.Generic;
using Streamus.Domain;
using Streamus.Domain.Managers;
using Streamus.Dto;

namespace Streamus.Tests
{
    /// <summary>
    ///     Stores common methods used by tests. Just useful for keeping things DRY between test cases.
    /// </summary>
    public static class Helpers
    {
        private static readonly PlaylistItemManager PlaylistItemManager = new PlaylistItemManager();
        private static readonly StreamManager StreamManager = new StreamManager();

        /// <summary>
        ///     Creates a new Video and PlaylistItem, puts item in the database and then returns
        ///     the item. Just a nice utility method to keep things DRY.
        /// </summary>
        public static PlaylistItem CreateItemInPlaylist(Playlist playlist)
        {
            Video videoNotInDatabase = CreateUnsavedVideoWithId();

            //  Create a new PlaylistItem and write it to the database.
            string title = videoNotInDatabase.Title;
            var playlistItem = new PlaylistItem(title, videoNotInDatabase);

            playlist.AddItem(playlistItem);
            PlaylistItemManager.Save(playlistItem);

            return playlistItem;
        }

        /// <summary>
        ///     Creates a new Video with a random Id, or a given Id if specified, saves it to the database and returns it.
        /// </summary>
        public static Video CreateUnsavedVideoWithId(string idOverride = "", string titleOverride = "")
        {
            //  Create a random video ID to ensure the Video doesn't exist in the database currently.
            string randomVideoId = idOverride == string.Empty ? Guid.NewGuid().ToString().Substring(0, 11) : idOverride;
            string title = titleOverride == string.Empty ? string.Format("Video {0}", randomVideoId) : titleOverride;
            var video = new Video(randomVideoId, title, 999, "Author");

            return video;
        }

        /// <summary>
        ///     Create a new Stream, save it to the DB, then generate a PlaylistDto which has the
        ///     Stream as its parent.
        /// </summary>
        /// <returns></returns>
        public static PlaylistDto CreatePlaylistDto()
        {
            var stream = new Stream();
            StreamManager.Save(stream);

            var playlistDto = new PlaylistDto
                {
                    StreamId = stream.Id
                };

            return playlistDto;
        }

        /// <summary>
        ///     Create a new Stream and Playlist, save them to the DB, then generate a PlaylistItemDto
        ///     which has those entities as its parents.
        /// </summary>
        public static PlaylistItemDto CreatePlaylistItemDto()
        {
            var stream = new Stream();
            Playlist playlist = stream.CreateAndAddPlaylist();

            StreamManager.Save(stream);

            Video video = CreateUnsavedVideoWithId();
            VideoDto videoDto = VideoDto.Create(video);

            var playlistItemDto = new PlaylistItemDto
                {
                    PlaylistId = playlist.Id,
                    Video = videoDto
                };

            return playlistItemDto;
        }

        /// <summary>
        ///     Create a new Stream and Playlist, save them to the DB, then generate N PlaylistItemDtos
        ///     which have those entities as their parents.
        /// </summary>
        public static List<PlaylistItemDto> CreatePlaylistItemsDto(int itemsToCreate, Guid playlistId = default(Guid))
        {
            if (playlistId == default(Guid))
            {
                var stream = new Stream();
                Playlist playlist = stream.CreateAndAddPlaylist();

                StreamManager.Save(stream);
                playlistId = playlist.Id;
            }

            Video video = CreateUnsavedVideoWithId();
            VideoDto videoDto = VideoDto.Create(video);

            List<PlaylistItemDto> playlistItemDtos = new List<PlaylistItemDto>(itemsToCreate);

            for (int i = 0; i < itemsToCreate; i++)
            {
                var playlistItemDto = new PlaylistItemDto
                {
                    PlaylistId = playlistId,
                    Video = videoDto
                };

                playlistItemDtos.Add(playlistItemDto);
            }

            return playlistItemDtos;
        }
    }
}
