/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package edu.umw.cs.smeagol.model;

public class Meta {
    private String clientID;
    private Page page;
    private String service;

    public Meta() {}
    
    public String getClientID() {
        return clientID;
    }

    public void setClientID(String clientID) {
        this.clientID = clientID;
    }

    public String getService() {
        return service;
    }

    public void setService(String s) {
        service = s;
    }

    public Page getPage() {
        return page;
    }

    public void setPage(Page page) {
        this.page = page;
    }
}
