package edu.umw.cs.smeagol.model.sparql;

import java.util.List;


public class Results {
    private List<Result> rowResults;

    public Results() {}

    public List<Result> getRowResults() {
        return rowResults;
    }

    public void setRowResults(List<Result> rowResults) {
        this.rowResults = rowResults;
    }
}
