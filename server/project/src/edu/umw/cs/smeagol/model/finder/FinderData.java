package edu.umw.cs.smeagol.model.finder;

import java.util.List;

import edu.umw.cs.smeagol.model.IData;

public class FinderData implements IData  {
    private List<Result> results;

    public FinderData() {}

    public List<Result> getResults() {
        return results;
    }

    public void setResults(List<Result> results) {
        this.results = results;
    }
}
