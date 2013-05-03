using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Mvc;
using DotNetOpenAuth.OAuth2;
using Google.Apis.Authentication.OAuth2;
using Google.Apis.Authentication.OAuth2.DotNetOpenAuth;
using Google.Apis.Services;

using Google.Apis.Tasks.v1;
using Google.Apis.Tasks.v1.Data;
using Google.Apis.Util;


namespace Streamus.Controllers
{
    public class HomeController : Controller
    {
        /// <summary>
        /// There's no website, but this is needed just to show a 'Server is Running' page.
        /// </summary>
        public ActionResult Index()
        {

            // Display the header and initialize the sample.
            //CommandLine.EnableExceptionHandling();
            //CommandLine.DisplayGoogleSampleHeader("Tasks API");

            // Register the authenticator.
            var provider = new NativeApplicationClient(GoogleAuthenticationServer.Description)
            {
                ClientIdentifier = "346456917689-kmkvbtmhafoak5glon55do0ukqppsh6l.apps.googleusercontent.com",
                ClientSecret = "VfOFLGVHO58dNQ3qVPqkah0H"
            };
            var auth = new OAuth2Authenticator<NativeApplicationClient>(provider, GetAuthorization);

            // Create the service.
            var service = new TasksService(new BaseClientService.Initializer
            {
                Authenticator = auth
            });

            TaskLists results = service.Tasklists.List().Fetch();
            Console.WriteLine("Lists:");
            foreach (TaskList list in results.Items)
            {
                Console.WriteLine("- " + list.Title);
            }
            Console.ReadKey();


            return View();
        }

        private static IAuthorizationState GetAuthorization(NativeApplicationClient arg)
        {
            // Get the auth URL: https://accounts.google.com/o/oauth2/token 
            IAuthorizationState state = new AuthorizationState(new[] { "https://www.googleapis.com/auth/plus.me" });
            state.Callback = new Uri(NativeApplicationClient.OutOfBandCallbackUrl);
            //Uri authUri = arg.RequestUserAuthorization(state);

            // Request authorization from the user (by opening a browser window):
            //Process.Start(authUri.ToString());
            Console.Write("  Authorization Code: ");
            string authCode = "4/umYAjGevSO3rvuHmPcr3HElcmW0Z.4rutXxfxisgbEnp6UAPFm0FiEY7RfAI"; // Console.ReadLine();
            Console.WriteLine();

            // Retrieve the access token by using the authorization code:
            return arg.ProcessUserAuthorization(authCode, state);
        }
    }
}
