/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package edu.umw.cs.smeagol.model;


public class Page {
    private int offset;
    private int count;
    private int total;

    public Page() { }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getOffset() {
        return offset;
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
