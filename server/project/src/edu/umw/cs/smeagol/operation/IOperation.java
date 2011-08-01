package edu.umw.cs.smeagol.operation;

import java.util.Map;
import edu.umw.cs.smeagol.model.IResponse;

public interface IOperation {
    public IResponse execute(Map<String, String> params) throws OperationException;
}
