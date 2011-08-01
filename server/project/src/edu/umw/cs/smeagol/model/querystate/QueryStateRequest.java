package edu.umw.cs.smeagol.model.querystate;

import edu.umw.cs.smeagol.model.*;

public class QueryStateRequest extends AbstractRequest {

    @Override
    public RequestData getData() {
        return (RequestData)data;
    }
}
