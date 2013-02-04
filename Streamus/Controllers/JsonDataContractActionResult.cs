using System;
using System.Runtime.Serialization.Json;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class JsonDataContractActionResult : JsonResult
    {
        /// <summary>
        ///     http://stackoverflow.com/questions/1302946/asp-net-mvc-controlling-serialization-of-property-names-with-jsonresult
        ///     Handles the naming conventions for converting C# objects to JavaScript objects.
        /// </summary>
        /// <param name="data">The object to be serialized under data contract. </param>
        public JsonDataContractActionResult(Object data)
        {
            Data = data;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            var serializer = new DataContractJsonSerializer(Data.GetType());
            context.HttpContext.Response.ContentType = "application/json";
            serializer.WriteObject(context.HttpContext.Response.OutputStream, Data);
        }
    }
}