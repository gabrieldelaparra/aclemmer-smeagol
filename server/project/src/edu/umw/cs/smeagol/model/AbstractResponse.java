package edu.umw.cs.smeagol.model;

import com.google.gson.Gson;


public abstract class AbstractResponse implements IResponse {
    protected Meta meta;
    protected IData data;

    public Meta getMeta() {
        return meta;
    }

    public void setMeta(Meta meta) {
        this.meta = meta;
    }

    public IData getData() {
        return data;
    }

    public void setData(IData data) {
        this.data = data;
    }

    public String toJSON() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }
}
