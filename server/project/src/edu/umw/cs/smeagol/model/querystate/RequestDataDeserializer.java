package edu.umw.cs.smeagol.model.querystate;

import com.google.gson.*;
import edu.umw.cs.smeagol.model.IData;
import java.lang.reflect.Type;

public class RequestDataDeserializer implements JsonDeserializer<IData> {

    public IData deserialize(JsonElement json, Type type, JsonDeserializationContext jdc) throws JsonParseException {
        JsonObject jso = json.getAsJsonObject();
        RequestData qsd = new RequestData();

        qsd.setId(jso.get("id").getAsString());
        qsd.setDate(jso.get("date").getAsString());
        qsd.setName(jso.get("name").getAsString());
        qsd.setOwner(jso.get("owner").getAsString());
        qsd.setState(jso.get("state").getAsString());

        return qsd;
    }
}
