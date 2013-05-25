using System;
using System.ComponentModel;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using Streamus.App_Start;
using Streamus.Dao;

namespace Streamus
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            var json = GlobalConfiguration.Configuration.Formatters.JsonFormatter;
            json.SerializerSettings.PreserveReferencesHandling = Newtonsoft.Json.PreserveReferencesHandling.All;

            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            //  Register your new model binder
            ModelBinders.Binders.DefaultBinder = new JsonEmptyStringNotNullModelBinder();

            AutofacRegistrations.RegisterDaoFactory();
        }
    }

    public class JsonEmptyStringNotNullModelBinder : DefaultModelBinder
    {
        //  Ensures that when JSON is deserialized null strings become empty.strings before persisting to the database.
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            bindingContext.ModelMetadata.ConvertEmptyStringToNull = false;
            Binders = new ModelBinderDictionary() { DefaultBinder = this };
            return base.BindModel(controllerContext, bindingContext);
        }
    }
}