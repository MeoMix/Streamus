using System.Web.Mvc;
using System.Web.Routing;

namespace Streamus.App_Start
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "post-Playlist",
                "{controller}",
                new {controller = "Playlist", action = "create"},
                new {httpMethod = new HttpMethodConstraint("POST")}
                );

            routes.MapRoute(
                "get-Playlist",
                "{controller}/{id}/{userId}",
                new {controller = "Playlist", action = "get"},
                new {httpMethod = new HttpMethodConstraint("GET")}
                );

            routes.MapRoute(
                "put-Playlist",
                "{controller}",
                new {controller = "Playlist", action = "update"},
                new {httpMethod = new HttpMethodConstraint("PUT")}
                );

            routes.MapRoute(
                "delete-Playlist",
                "{controller}/{id}/{userId}",
                new {controller = "Playlist", action = "delete"},
                new {httpMethod = new HttpMethodConstraint("DELETE")}
                );

            routes.MapRoute(
                "Default",
                "{controller}/{action}/{id}",
                new {controller = "Home", action = "Index", id = UrlParameter.Optional}
                );
        }
    }
}