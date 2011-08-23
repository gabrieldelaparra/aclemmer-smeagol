/******************************************************************************
    Smeagol
    Copyright (C) 2010-2011  Aaron Clemmer, Stephen Davies

    This file is part of Smeagol.

    Smeagol is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/
package edu.umw.cs.smeagol.operation;

import java.util.Map;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.PreparedStatement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.umw.cs.smeagol.model.*;
import edu.umw.cs.smeagol.model.querystate.*;
import java.sql.Date;
import java.sql.ResultSet;


public class ListStatesOp extends AbstractDatabaseOperation {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public IResponse execute(Map<String, String> params) throws OperationException {
        if (!params.containsKey("ownerId")) {
            throw new OperationException("Missing parameter 'ownerId'");
        }

        int ownerId = Integer.parseInt(params.get("ownerId"));

        StatusResponseData data = new StatusResponseData();
        String state = "";
        if ((state = doLoad(ownerId)) != null) {
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


    protected String doLoad(int ownerId) {
        String result = null;
        Connection conn = getConnection();
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            stmt = conn.prepareStatement("SELECT id, name, date_created FROM smeagol_state WHERE owner = ? ORDER BY name ASC");
            stmt.setInt(1, ownerId);
            rs = stmt.executeQuery();

            if (rs.next()) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("[");
                    do {
                        int id = rs.getInt(1);
                        String name= rs.getString(2);
                        Date date = rs.getDate(3);

                        sb.append("{");
                        sb.append("\"id\":\"").append(id).append("\",");
                        sb.append("\"name\":\"").append(name).append("\",");
                        sb.append("\"date\":\"").append(date.getTime()).append("\"");
                        sb.append("},");
                    } while (rs.next());
                    sb.deleteCharAt(sb.length()-1);
                    sb.append("]");
                    result = sb.toString();
            }
            else {
                    result = "[]";
            }
        }
        catch (SQLException ex){
            logSQLError("Error listing states.", ex);
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
