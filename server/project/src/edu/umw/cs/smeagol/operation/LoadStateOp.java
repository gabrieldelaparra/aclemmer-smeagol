package edu.umw.cs.smeagol.operation;

import java.util.Map;
import java.io.Reader;
import java.io.StringReader;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.PreparedStatement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.umw.cs.smeagol.model.*;
import edu.umw.cs.smeagol.model.querystate.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.ResultSet;


public class LoadStateOp extends AbstractDatabaseOperation {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public IResponse execute(Map<String, String> params) throws OperationException {
        if (!params.containsKey("stateId")) {
            throw new OperationException("Missing parameter 'stateId'");
        }

        int stateId = Integer.parseInt(params.get("stateId"));

        StatusResponseData data = new StatusResponseData();
        String state = "";
        if ((state = doLoad(stateId)) != null) {
                data.setCode(0);
                data.setMessage("Success");
                data.setPayload(state);
        }
        else {
                data.setCode(1);
                data.setMessage("Error");
                data.setPayload(state);
        }

        Page page = new Page();
        page.setOffset(0);
        page.setCount(1);
        page.setTotal(1);
        Meta meta = new Meta();
        meta.setService("loadstate");
        meta.setClientID("");
        meta.setPage(page);

        //Build the response.
        QueryStateResponse result = new QueryStateResponse();
        result.setMeta(meta);
        result.setData(data);
        return result;
    }


    protected String doLoad(int stateId) {
        String result = null;
        Connection conn = getConnection();
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            stmt = conn.prepareStatement("SELECT state FROM smeagol_state WHERE id = ?");
            stmt.setInt(1, stateId);
            rs = stmt.executeQuery();

            if (rs.first()) {
                BufferedReader r = new BufferedReader(rs.getClob(1).getCharacterStream());

                char[] cbuf = new char[65536];
                StringBuilder sb = new StringBuilder();

                int read_this_time = 0;
                while (read_this_time != -1) {
                    read_this_time = r.read(cbuf, 0, cbuf.length);
                    if (read_this_time != -1)
                            sb.append(cbuf,0,read_this_time);
                }

                result = sb.toString();
            }
        }
        catch (SQLException ex){
            logSQLError("Error inserting state.", ex);
        }
        catch (IOException ex) {
            logger.error("Error reading resultset", ex);
        }
        finally {
            if (stmt != null) {
                try {
                    stmt.close();
                } catch (SQLException ex) { }
                stmt = null;
            }

            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException ex) { }
                conn = null;
            }
        }

        return result;
    }

}
