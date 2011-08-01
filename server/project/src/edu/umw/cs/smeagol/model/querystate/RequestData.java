package edu.umw.cs.smeagol.model.querystate;

import edu.umw.cs.smeagol.model.IData;


public class RequestData implements IData {
    private String id;
    private String owner;
    private String name;
    private String date;
    private String state;

    public RequestData() {}

    public String getId() {
        return id;
    }

    public String getOwner() {
        return owner;
    }

    public String getName() {
        return name;
    }

    public String getDate() {
        return date;
    }

    public String getState() {
        return state;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setState(String state) {
        this.state = state;
    }

}

