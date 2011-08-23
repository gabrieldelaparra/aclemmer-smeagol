/******************************************************************************
    Smeagol
    Copyright (C) 2010-2011  Aaron Clemmer, Stephen Davies

    This file is part of Smeagol.

    Smeagol is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/
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
