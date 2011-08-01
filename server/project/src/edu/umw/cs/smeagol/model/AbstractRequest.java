package edu.umw.cs.smeagol.model;


public abstract class AbstractRequest implements IRequest {
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
}
