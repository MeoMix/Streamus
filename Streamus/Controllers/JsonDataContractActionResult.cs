using System;
using System.Runtime.Serialization.Json;
using System.Web.Mvc;
using Streamus.Domain.Interfaces;

namespace Streamus.Controllers
{
    public class JsonDataContractActionResult : JsonResult
    {
        /// <summary>
        ///     http://stackoverflow.com/questions/1302946/asp-net-mvc-controlling-serialization-of-property-names-with-jsonresult
        ///     Handles the naming conventions for converting C# objects to JavaScript objects.
        /// </summary>
        /// <param name="data">The object to be serialized under data contract. </param>
        public JsonDataContractActionResult(object data)
        {
            //  Ensure that programmers are returning the proper entities.
            if (data is IAbstractDomainEntity<Guid> || data is IAbstractDomainEntity<string>)
            {
                throw new Exception("Attempted serialization of domain entity detected. Only DTOs should be serialized.");
            }

            Data = data;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            if (Data != null)
            {
                var serializer = new DataContractJsonSerializer(Data.GetType());
                context.HttpContext.Response.ContentType = "application/json; charset=utf-8";
                serializer.WriteObject(context.HttpContext.Response.OutputStream, Data);
            }
        }
    }
}