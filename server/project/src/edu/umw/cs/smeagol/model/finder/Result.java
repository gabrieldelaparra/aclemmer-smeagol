package edu.umw.cs.smeagol.model.finder;

import java.util.List;
import java.util.ArrayList;

public class Result {
    private String label;
    private String uri;
    private String description;
    private List<String> classes;
    private List<String> categories;

    public Result() {
        classes = new ArrayList<String>();
        categories = new ArrayList<String>();
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void addClass(String className) {
        classes.add(className);
    }

    public List<String> getClasses() {
        return classes;
    }

    public void addCategory(String categoryName) {
        categories.add(categoryName);
    }

    public List<String> getCategories() {
        return categories;
    }
}
