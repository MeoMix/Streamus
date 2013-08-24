using System.Web.Mvc;
using System.Web.Routing;

namespace Streamus.App_Start
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute("post-Error", "Error", new {controller = "Error", action = "create"},
                            new {httpMethod = new HttpMethodConstraint("POST")});

            routes.MapRoute("post-User", "User", new {controller = "User", action = "create"},
                            new {httpMethod = new HttpMethodConstraint("POST")});

            routes.MapRoute("get-User", "User/{id}", new {controller = "User", action = "get"},
                            new {httpMethod = new HttpMethodConstraint("GET")});

            routes.MapRoute("put-User", "User", new {controller = "User", action = "update"},
                            new {httpMethod = new HttpMethodConstraint("PUT")});

            routes.MapRoute("delete-User", "User/{id}", new {controller = "User", action = "delete"},
                            new {httpMethod = new HttpMethodConstraint("DELETE")});

            routes.MapRoute("updateFirstItem", "Playlist/UpdateFirstItem",
                            new {controller = "Playlist", action = "UpdateFirstItem"},
                            new {httpMethod = new HttpMethodConstraint("POST")});

            routes.MapRoute("updateTitle", "Playlist/UpdateTitle",
                new { controller = "Playlist", action = "UpdateTitle" },
                new { httpMethod = new HttpMethodConstraint("POST") });

            routes.MapRoute("post-Playlist", "Playlist", new {controller = "Playlist", action = "create"},
                            new {httpMethod = new HttpMethodConstraint("POST")});

            routes.MapRoute("createCopyByShareCode", "Playlist/CreateCopyByShareCode", new { controller = "Playlist", action = "CreateCopyByShareCode" },
                new { httpMethod = new HttpMethodConstraint("GET") });

            routes.MapRoute("get-Playlist", "Playlist/{id}", new {controller = "Playlist", action = "get"},
                            new {httpMethod = new HttpMethodConstraint("GET")});

            routes.MapRoute("put-Playlist", "Playlist/{id}", new {controller = "Playlist", action = "update"},
                            new {httpMethod = new HttpMethodConstraint("PUT")});

            routes.MapRoute("delete-Playlist", "Playlist/{id}", new {controller = "Playlist", action = "delete"},
                            new {httpMethod = new HttpMethodConstraint("DELETE")});

            routes.MapRoute("createMultiple", "PlaylistItem/CreateMultiple",
                new { controller = "PlaylistItem", action = "CreateMultiple" },
                new { httpMethod = new HttpMethodConstraint("POST") });

            routes.MapRoute("post-PlaylistItem", "PlaylistItem", new {controller = "PlaylistItem", action = "create"},
                            new {httpMethod = new HttpMethodConstraint("POST")});

            routes.MapRoute("updateMultiple", "PlaylistItem/UpdateMultiple",
                new { controller = "PlaylistItem", action = "UpdateMultiple" },
                new { httpMethod = new HttpMethodConstraint("PUT") });

            routes.MapRoute("put-PlaylistItem", "PlaylistItem/{id}",
                            new {controller = "PlaylistItem", action = "update"},
                            new {httpMethod = new HttpMethodConstraint("PUT")});

            routes.MapRoute("delete-PlaylistItem", "PlaylistItem/{id}",
                            new {controller = "PlaylistItem", action = "delete"},
                            new {httpMethod = new HttpMethodConstraint("DELETE")});

            routes.MapRoute("getByIds", "Video/GetByIds",
                            new {controller = "Video", action = "GetByIds"},
                            new {httpMethod = new HttpMethodConstraint("GET")});

            routes.MapRoute("put-Video", "Video/{id}", new {controller = "Video", action = "update"},
                            new {httpMethod = new HttpMethodConstraint("PUT")});

            routes.MapRoute("get-Video", "Video/{id}", new {controller = "Video", action = "get"},
                            new {httpMethod = new HttpMethodConstraint("GET")});

            routes.MapRoute("getShareCode", "ShareCode/GetShareCode", new { controller = "ShareCode", action = "GetShareCode" },
                new { httpMethod = new HttpMethodConstraint("GET") });

            routes.MapRoute("get-ShareCode", "ShareCode/{id}", new { controller = "ShareCode", action = "get" },
                new { httpMethod = new HttpMethodConstraint("GET") });

            routes.MapRoute(
                "Default",
                "{controller}/{action}/{id}",
                new {controller = "Home", action = "Index", id = UrlParameter.Optional}
                );
        }
    }
}