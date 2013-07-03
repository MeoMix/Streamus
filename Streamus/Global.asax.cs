using System.Net.Http.Formatting;
using AutoMapper;
using Newtonsoft.Json;
using Streamus.App_Start;
using Streamus.Dao;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using Streamus.Domain;
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
        private static void CreateAutoMapperMaps()
        {
            Mapper.CreateMap<Error, ErrorDto>().ReverseMap();
            Mapper.CreateMap<Playlist, PlaylistDto>().ReverseMap();
            Mapper.CreateMap<PlaylistItem, PlaylistItemDto>().ReverseMap();
            Mapper.CreateMap<ShareCode, ShareCodeDto>().ReverseMap();
            Mapper.CreateMap<Stream, StreamDto>().ReverseMap();
            Mapper.CreateMap<User, UserDto>().ReverseMap();
            Mapper.CreateMap<Video, VideoDto>().ReverseMap();
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