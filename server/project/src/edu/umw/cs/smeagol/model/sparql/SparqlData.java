package edu.umw.cs.smeagol.model.sparql;

import java.util.List;

import edu.umw.cs.smeagol.model.IData;


public class SparqlData implements IData {
    private List<Results> results;

    public SparqlData() {}

    public List<Results> getResults() {
        return results;
    }

    public void setResults(List<Results> results) {
        this.results = results;
    }
}
