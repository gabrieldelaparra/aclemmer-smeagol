package edu.umw.cs.smeagol.resources;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import edu.umw.cs.smeagol.model.Cache;
import edu.umw.cs.smeagol.model.IData;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import edu.umw.cs.smeagol.operation.*;
import edu.umw.cs.smeagol.model.IResponse;
import edu.umw.cs.smeagol.model.querystate.RequestDataDeserializer;
import edu.umw.cs.smeagol.model.querystate.QueryStateRequest;


@Path("/smeagol")
public class SmeagolResource {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());


    @Path("/sparql")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String query(@DefaultValue("") @QueryParam("sparql") String sparql,
                               @DefaultValue("") @QueryParam("cachekey") String cacheKey,
                               @DefaultValue("") @QueryParam("clientId") String clientId,
                               @DefaultValue("0") @QueryParam("offset") int offset,
                               @DefaultValue("50") @QueryParam("count") int count) {
        MDC.put("clientId", clientId);
        logger.info("Received request for sparql(): sparql={}, cachekey=" + cacheKey + ", offset=" + offset + ", count=" + count, sparql);
        /*try {
                Thread.sleep(6000);
        } catch (InterruptedException ex) {
                java.util.logging.Logger.getLogger(SmeagolResource.class.getName()).log(Level.SEVERE, null, ex);
        }*/

        Map<String, String> params = new HashMap<String, String>();
        params.put("query", sparql);
        params.put("offset", Integer.toString(offset));
        params.put("count", Integer.toString(count));

        Cache cache = Cache.getInstance();
        String json = cache.load(cacheKey, offset, count);

        if (json == null) {
            logger.info("Cache miss for {}, " + offset + ", " + count, cacheKey);
            IOperation op = new SparqlQueryOp();
            IResponse result = null;
            try {
                result = op.execute(params);
            } catch (OperationException ex) {
                logger.error("Got an operation exception: " + ex.getMessage());
                return "{\"error\": \"Got an operation exception: " + ex.getMessage() + "\"}";
            }

            json = result.toJSON();
            cache.store(cacheKey, offset, count, json);
        }
        else {
            logger.info("Cache hit for {}, " + offset + ", " + count, cacheKey);
        }

        logger.info("Produced result: {}", json);
        return json;
    }

    @Path("/finder")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String find(@DefaultValue("") @QueryParam("keyword") String keyword,
            @DefaultValue("") @QueryParam("clientId") String clientId,
            @DefaultValue("0") @QueryParam("offset") int offset,
            @DefaultValue("50") @QueryParam("count") int count) {
        MDC.put("clientId", clientId);

        logger.info("Received request for URI lookup: " + keyword);
        Map<String, String> params = new HashMap<String, String>();
        params.put("keyword", keyword);
        params.put("offset", Integer.toString(offset));
        params.put("count", Integer.toString(count));
        IOperation op = new FindOp();
        IResponse result = null;
        try {
            result = op.execute(params);
        } catch (OperationException ex) {
            logger.error("Got an operation exception: " + ex.getMessage());
            return "{\"error\": \"Got an operation exception: " + ex.getMessage() + "\"}";
        }

        String json = result.toJSON();
        logger.info("Produced result: {}", json);
        return json;
    }


    @Path("/savestate")
    @POST
    @Consumes (MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String savestate(String postData,
            @DefaultValue("") @QueryParam("clientId") String clientId,
	    @DefaultValue("") @QueryParam("name") String name) {
        MDC.put("clientId", clientId);
        logger.info("Save request for " + clientId + "(" + name + "): " + postData);

	//Gson gson = new GsonBuilder().registerTypeAdapter(IData.class, new RequestDataDeserializer()).create();
	//QueryStateRequest qsr = gson.fromJson(postData, QueryStateRequest.class);

        Map<String, String> params = new HashMap<String, String>();
        params.put("owner", clientId);
	params.put("name", name);
	params.put("state", postData);

        IOperation op = new SaveStateOp();
        IResponse result = null;
        try {
            result = op.execute(params);
        } catch (OperationException ex) {
            logger.error("Got an operation exception: " + ex.getMessage());
            return "{\"error\": \"Got an operation exception: " + ex.getMessage() + "\"}";
        }

        String json = result.toJSON();
        logger.info("Produced result: {}", json);
        return json;
    }


    @Path("/loadstate")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String loadstate(@DefaultValue("") @QueryParam("clientId") String clientId,
	    @DefaultValue("") @QueryParam("stateId") String stateId) {
        MDC.put("clientId", clientId);
        logger.info("Load request for " + clientId + ": " + stateId);

        Map<String, String> params = new HashMap<String, String>();
	params.put("stateId", stateId);

        IOperation op = new LoadStateOp();
        IResponse result = null;
        try {
            result = op.execute(params);
        } catch (OperationException ex) {
            logger.error("Got an operation exception: " + ex.getMessage());
            return "{\"error\": \"Got an operation exception: " + ex.getMessage() + "\"}";
        }

        String json = result.toJSON();
        logger.info("Produced result: {}", json);
        return json;
    }


    @Path("/liststates")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String liststates(@DefaultValue("") @QueryParam("clientId") String clientId) {
        MDC.put("clientId", clientId);
        logger.info("List request for " + clientId);

        Map<String, String> params = new HashMap<String, String>();
	params.put("ownerId", clientId);

        IOperation op = new ListStatesOp();
        IResponse result = null;
        try {
            result = op.execute(params);
        } catch (OperationException ex) {
            logger.error("Got an operation exception: " + ex.getMessage());
            return "{\"error\": \"Got an operation exception: " + ex.getMessage() + "\"}";
        }

        String json = result.toJSON();
        logger.info("Produced result: {}", json);
        return json;
    }
}
