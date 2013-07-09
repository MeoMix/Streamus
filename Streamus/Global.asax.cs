using System.Net.Http.Formatting;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using AutoMapper;
using Autofac;
using Newtonsoft.Json;
using Streamus.App_Start;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Dto;

namespace Streamus
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            JsonMediaTypeFormatter json = GlobalConfiguration.Configuration.Formatters.JsonFormatter;
            json.SerializerSettings.PreserveReferencesHandling = PreserveReferencesHandling.All;

            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            //  Register your new model binder
            ModelBinders.Binders.DefaultBinder = new JsonEmptyStringNotNullModelBinder();

            AutofacRegistrations.RegisterDaoFactory();

            CreateAutoMapperMaps();
        }

        /// <summary>
        ///     Initialize the AutoMapper mappings for the solution.
        ///     http://automapper.codeplex.com/
        /// </summary>
        public static void CreateAutoMapperMaps()
        {
            AutofacRegistrations.RegisterDaoFactory();
            ILifetimeScope scope = AutofacRegistrations.Container.BeginLifetimeScope();
            var daoFactory = scope.Resolve<IDaoFactory>();

            Mapper.CreateMap<Error, ErrorDto>()
                  .ReverseMap();

            IPlaylistItemDao playlistItemDao = daoFactory.GetPlaylistItemDao();
            IPlaylistDao playlistDao = daoFactory.GetPlaylistDao();
            IStreamDao streamDao = daoFactory.GetStreamDao();
            IUserDao userDao = daoFactory.GetUserDao();

            Mapper.CreateMap<Playlist, PlaylistDto>()
                  .ReverseMap()
                  .ForMember(playlist => playlist.FirstItem,
                             opt => opt.MapFrom(playlistDto => playlistItemDao.Get(playlistDto.FirstItemId)))
                  .ForMember(playlist => playlist.NextPlaylist,
                             opt => opt.MapFrom(playlistDto => playlistDao.Get(playlistDto.NextPlaylistId)))
                  .ForMember(playlist => playlist.PreviousPlaylist,
                             opt => opt.MapFrom(playlistDto => playlistDao.Get(playlistDto.PreviousPlaylistId)))
                  .ForMember(playlist => playlist.Stream,
                             opt => opt.MapFrom(playlistDto => streamDao.Get(playlistDto.StreamId)));

            Mapper.CreateMap<PlaylistItem, PlaylistItemDto>()
                  .ReverseMap()
                  .ForMember(playlistItem => playlistItem.NextItem,
                             opt => opt.MapFrom(playlistItemDto => playlistItemDao.Get(playlistItemDto.NextItemId)))
                  .ForMember(playlistItem => playlistItem.PreviousItem,
                             opt => opt.MapFrom(playlistItemDto => playlistItemDao.Get(playlistItemDto.PreviousItemId)))
                  .ForMember(playlistItem => playlistItem.Playlist,
                             opt => opt.MapFrom(playlistItemDto => playlistDao.Get(playlistItemDto.PlaylistId)));

            Mapper.CreateMap<ShareCode, ShareCodeDto>().ReverseMap();

            Mapper.CreateMap<Stream, StreamDto>()
                  .ReverseMap()
                  .ForMember(stream => stream.FirstPlaylist,
                             opt => opt.MapFrom(streamDto => playlistDao.Get(streamDto.FirstPlaylistId)));

            Mapper.CreateMap<User, UserDto>().ReverseMap();
            Mapper.CreateMap<Video, VideoDto>().ReverseMap();

            Mapper.AssertConfigurationIsValid();
        }
    }

    public class JsonEmptyStringNotNullModelBinder : DefaultModelBinder
    {
        //  Ensures that when JSON is deserialized null strings become empty.strings before persisting to the database.
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            bindingContext.ModelMetadata.ConvertEmptyStringToNull = false;

            Binders = new ModelBinderDictionary
                {
                    DefaultBinder = this
                };

            return base.BindModel(controllerContext, bindingContext);
        }
    }
}